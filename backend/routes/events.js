import express from "express";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { isAuthenticated } from "../middleware/auth.js";

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
            ],
          },
        },
      },
    ]);

    res.status(200).send(results);
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

    const events = await Event.find({ organizerIds: user._id }).lean();

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
 * Get a single event by ID
 */
router.get("/:id", isAuthenticated, async (req, res) => {
  const user = req.user;

  try {
    let result = await Event.findById(req.params.id).lean(); // Mongoose simplifies finding by ID

    if (!result) {
      return res.status(404).send("Not found");
    }

    console.log(result);

    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let endDate = new Date(result.endDate);
    let organizerIds = result.organizerIds.map(id => id.toString());

    const userIdString = user._id.toString();

    if (organizerIds.includes(userIdString)) {
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
    } else {
      return res.status(404).send("Not found");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Route encountered an error.");
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
    const result = await newEvent.save();
    res.status(201).send(result);
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
router.put("/donate/:id", isAuthenticated, async (req, res) => {
  const user = req.user;

  const eventId = req.params.id;
  let { donation } = req.body;

  if (!donation) {
    return res.status(400).send({ error: "Donation is empty" });
  }

  try {
    donation = {
      ...donation,
      userId: user._id,
    }

    const originalEvent = await Event.findById(eventId);
    if (!originalEvent) {
      return res.status(404).send({ error: "Event to donate to not found" });
    }

    // Update fields (only if they are provided and valid)
    if (donation.amount == undefined) {
      return res.status(400).send({ error: "Donation amount is required" });
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

export default router;
