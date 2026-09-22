const express = require("express");
const router = express.Router();

const Lead = require("../models/Lead");
const auth = require("../middleware/auth");

/*
====================================================
PUBLIC WEBSITE CONTACT FORM
POST /api/leads/public
====================================================
*/

router.post("/public", async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    // Create new lead
    const lead = await Lead.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      source: "Website",
      status: "New",
      notes: notes ? notes.trim() : "",
      followUps: [],
    });

    res.status(201).json({
      message: "Lead submitted successfully",
      lead,
    });
  } catch (error) {
    console.error("Public lead error:", error);

    res.status(500).json({
      message: "Failed to submit lead",
    });
  }
});


/*
====================================================
GET ALL LEADS
GET /api/leads
Protected route
====================================================
*/

router.get("/", auth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    console.error("Get leads error:", error);

    res.status(500).json({
      message: "Failed to fetch leads",
    });
  }
});


/*
====================================================
GET SINGLE LEAD
GET /api/leads/:id
Protected route
====================================================
*/

router.get("/:id", auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json(lead);
  } catch (error) {
    console.error("Get lead error:", error);

    res.status(500).json({
      message: "Failed to fetch lead",
    });
  }
});


/*
====================================================
CREATE LEAD FROM ADMIN DASHBOARD
POST /api/leads
Protected route
====================================================
*/

router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      source,
      status,
      notes,
      followUps,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone: phone || "",
      source: source || "Manual",
      status: status || "New",
      notes: notes || "",
      followUps: followUps || [],
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error("Create lead error:", error);

    res.status(500).json({
      message: "Failed to create lead",
    });
  }
});


/*
====================================================
UPDATE COMPLETE LEAD
PUT /api/leads/:id
Protected route
====================================================
*/

router.put("/:id", auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json(lead);
  } catch (error) {
    console.error("Update lead error:", error);

    res.status(500).json({
      message: "Failed to update lead",
    });
  }
});


/*
====================================================
UPDATE LEAD STATUS
PATCH /api/leads/:id/status
Protected route
====================================================
*/

router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "New",
      "Contacted",
      "Converted",
      "Not Interested",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid lead status",
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json(lead);
  } catch (error) {
    console.error("Status update error:", error);

    res.status(500).json({
      message: "Failed to update status",
    });
  }
});


/*
====================================================
UPDATE LEAD NOTES
PATCH /api/leads/:id/notes
Protected route
====================================================
*/

router.patch("/:id/notes", auth, async (req, res) => {
  try {
    const { notes } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { notes: notes || "" },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json(lead);
  } catch (error) {
    console.error("Notes update error:", error);

    res.status(500).json({
      message: "Failed to update notes",
    });
  }
});


/*
====================================================
ADD FOLLOW-UP
POST /api/leads/:id/followups
Protected route
====================================================
*/

router.post("/:id/followups", auth, async (req, res) => {
  try {
    const { date, note } = req.body;

    if (!date || !note) {
      return res.status(400).json({
        message: "Follow-up date and note are required",
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    lead.followUps.push({
      date,
      note,
    });

    await lead.save();

    res.json(lead);
  } catch (error) {
    console.error("Follow-up error:", error);

    res.status(500).json({
      message: "Failed to add follow-up",
    });
  }
});


/*
====================================================
DELETE LEAD
DELETE /api/leads/:id
Protected route
====================================================
*/

router.delete("/:id", auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json({
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete lead error:", error);

    res.status(500).json({
      message: "Failed to delete lead",
    });
  }
});


module.exports = router;