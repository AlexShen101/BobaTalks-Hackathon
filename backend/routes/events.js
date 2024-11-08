import express from "express";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { isAuthenticated } from "../middleware/auth.js";
import { generateEmbedding, upsertToPinecone, searchSimilarEvents, deleteFromPinecone } from '../services/pineconeService.js';

const router = express.Router();

/**
 * Fetches all events that the user should be able to see
 */
router.get("/", isAuthenticated, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const results = await Event.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $lt: ["$currentMoney", "$goalAmount"] },
              { $gte: ["$endDate", today] },
              { $ne: ["$toDelete", true] },
            ],
          },
        },
      },
    ]);

    const eventsWithOrganizers = await Promise.all(results.map(async (event) => {
      const organizers = await User.find({ _id: { $in: event.organizerIds } }, 'email');
      return {
        ...event,
        organizers: organizers.map(user => user.email)
      };
    }));

    res.status(200).send(eventsWithOrganizers);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).send("Error fetching events");
  }
});

/**
 * Fetches all events that the user has created
 */
router.get("/user", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;

    if (!user) return res.status(404).send("User not found");

    const events = await Event.find({
      organizerIds: user._id,
      toDelete: { $ne: true },
    }).lean();

    if (!events) return res.status(404).send("No events found.");

    const updatedEvents = await Promise.all(events.map(async (event) => {
      // get organizers
      let organizers = await User.find({ _id: { $in: event.organizerIds } }, 'email');
      // map organizers to get their emails
      event.organizers = organizers.map(user => user.email);
      return event;
    }));

    res.status(200).send(updatedEvents);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Route encountered an error.");
  }
});

/**
 * Perform pinecone semantic search for events
 */
router.get("/search", isAuthenticated, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Search in Pinecone
    const searchResults = await searchSimilarEvents(query);
    
    // Get full event details from MongoDB
    const eventIds = searchResults.map(result => result.id);
    const events = await Event.find({ 
      _id: { $in: eventIds },
      toDelete: { $ne: true },
      endDate: { $gte: today },
      $expr: {
        $lt: ["$currentMoney", "$goalAmount"]
      }
    });
    
    // Add organizers
    const eventsWithOrganizers = await Promise.all(events.map(async (event) => {
      const organizers = await User.find({ _id: { $in: event.organizerIds } }, 'email');
      return {
        ...event.toObject(),
        organizers: organizers.map(user => user.email),
        score: searchResults.find(r => r.id === event._id.toString())?.score
      };
    }));

    res.json(eventsWithOrganizers);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: "Error performing search" });
  }
});

/**
 * Adds a new document to the collection
 */
router.post("/", isAuthenticated, async (req, res) => {
  const {
    currentMoney,
    goalAmount,
    eventName,
    organizers,
    endDate,
    description,
    startDate,
    imageUrl,
  } = req.body;

  // get users
  const users = await User.find({ email: { $in: organizers } }, '_id');
  const organizerIds = users.map(user => user._id);

  try {
    // Create a new event instance using Mongoose
    const newEvent = new Event({
      currentMoney,
      goalAmount,
      eventName,
      organizerIds,
      description,
      endDate: new Date(endDate),
      startDate: new Date(startDate),
      donations: [],
      imageUrl,
    });

    // Save the new event to the database
    const savedEvent = await newEvent.save();

    // pinecone embedding stuff
    const contentForEmbedding = `${eventName} ${description}`;
    const embedding = await generateEmbedding(contentForEmbedding);

    await upsertToPinecone(savedEvent._id, embedding, {
      eventName,
      description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    res.status(201).send(savedEvent);
  } catch (error) {
    // If Mongoose throws a validation error, catch it and return a 400 bad request
    if (error.name === "ValidationError") {
      return res.status(400).send({ error: error.message });
    } else {
      // For other types of errors, return a 500 internal server error
      return res.status(500).send({ error: "Internal server error" });
    }
  }
});


/**
 * Get a single event by ID
 */
router.get("/:id", isAuthenticated, async (req, res) => {
  const user = req.user;

  try {
    let result = await Event.findOne({
      _id: req.params.id,
      toDelete: { $ne: true }
    }).lean();

    if (!result) {
      return res.status(404).send("Not found");
    }

    console.log(result);

    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let endDate = new Date(result.endDate);
    let organizerIds = result.organizerIds.map(id => id.toString());

    if (endDate < today) {
      return res.status(404).send("The event has passed!");
    } else {
      let currAmt = result.currentMoney;
      let targetAmt = result.goalAmount;

      if (currAmt >= targetAmt) {
        return res.status(404).send("The target amount has been reached!");
      } else {
        let organizers = await User.find({ _id: { $in: organizerIds } }, 'email');
        // map organizers to get their emails
        organizers = organizers.map(user => user.email);
        result.organizers = organizers;
        return res.status(200).send(result);
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Route encountered an error.");
  }
});


/**
 * Edit an existing event
 */
router.put("/:id", isAuthenticated, async (req, res) => {
  const eventId = req.params.id;

  const updatableFields = Object.keys(Event.schema.paths).filter((field) => {
    return !['_id', '__v', 'donations', 'currentMoney'].includes(field);
  });

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send({ error: "Event to edit not found" });
    }

    // Loop through each item specified in updates, update event with their valuess
    updatableFields.forEach(key => {
      if (req.body[key] !== undefined) {
        event[key] = req.body[key];
      }
    });

    // Validate the updated document before saving
    await event.validate();

    // Save the updates
    const result = await event.save();
    res.status(200).send({ message: "Event updated successfully", data: result });
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).send({ error: "Validation error: " + err.message });
    } else {
      console.error("Error updating event:", err);
      res.status(500).send({ error: "Internal server error" });
    }
  }
});


/**
 * Donate to an existing event
 */
router.put("/donate/:id", async (req, res) => {
  const user = req.user;
  const eventId = req.params.id;
  let {
    anonymous,
    donation_amount,
    thank_you_note
  } = req.body;

  if (!donation_amount) {
    return res.status(400).send({ error: "Donation is empty" });
  } else if (donation_amount < 0) {
    return res.status(400).send({ error: "Donation amount must be positive" });
  }

  try {
    const donation = {
      amount: donation_amount,
      userId: user._id,
      message: thank_you_note,
      anonymous
    }

    const originalEvent = await Event.findById(eventId);
    if (!originalEvent) {
      return res.status(404).send({ error: "Event to donate to not found" });
    }

    originalEvent.currentMoney += donation.amount;
    originalEvent.donations.push(donation);

    // Save the updates
    const result = await originalEvent.save();
    res
      .status(200)
      .send({ message: "Event updated successfully", data: result });
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).send({ error: err.message });
    } else {
      console.error("Error updating event:", err);
      res
        .status(500)
        .send({ error: "Update failed due to internal server error." });
    }
  }
});

/**
 * Soft delete an event by setting toDelete flag
 */
router.delete("/:id", isAuthenticated, async (req, res) => {
  const eventId = req.params.id;
  const user = req.user;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).send({ error: "Event not found" });
    }

    // Check if user is an organizer
    if (!event.organizerIds.includes(user._id) && user.role !== 'admin') {
      return res.status(403).send({ error: "Not authorized to delete this event" });
    }

    event.toDelete = true;
    await event.save();

    await deleteFromPinecone(eventId);

    res.status(200).send({ message: "Event marked for deletion successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});


export default router;
