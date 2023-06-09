/** Routes for Lunchly */

const express = require("express");

const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();

/** Homepage: show list of customers. */

// router.get("/", async function(req, res, next) {
//   try {
//     const customers = await Customer.all();
//     return res.render("customer_list.html", { customers });
//   } catch (err) {
//     return next(err);
//   }
// });

// modified search route below
// ternary operator checks if searchQuery is truthy ("" is falsy by default) and returns matching data
// if truthy, set customers to matching searchQuery and display on page
// default is falsy which returns Customer.all()
router.get("/", async function(req, res, next) {
  try {
    const searchQuery = req.query.search || "";
    const customers = searchQuery
      ? await Customer.search(searchQuery)
      : await Customer.all();
    return res.render("customer_list.html", { customers });
  } catch (err) {
    return next(err);
  }
});

/** Form to add a new customer. */

router.get("/add/", async function(req, res, next) {
  try {
    return res.render("customer_new_form.html");
  } catch (err) {
    return next(err);
  }
});

/** Handle adding a new customer. */

router.post("/add/", async function(req, res, next) {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phone = req.body.phone;
    const notes = req.body.notes;

    const customer = new Customer({ firstName, lastName, phone, notes });
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});

// Best Customers Route placed above /:id route to ping this route first, avoid conflict
router.get("/best-customers/", async function(req, res, next) {
  try {
    const customers = await Customer.topCustomers();
    return res.render("best_customers.html", { customers });
  } catch (err) {
    return next(err);
  }
});


/** Show a customer, given their ID. */

router.get("/:id/", async function(req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);

    const reservations = await customer.getReservations();

    return res.render("customer_detail.html", { customer, reservations });
  } catch (err) {
    return next(err);
  }
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function(req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);

    res.render("customer_edit_form.html", { customer });
  } catch (err) {
    return next(err);
  }
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function(req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);
    customer.firstName = req.body.firstName;
    customer.lastName = req.body.lastName;
    customer.phone = req.body.phone;
    customer.notes = req.body.notes;
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function(req, res, next) {
  try {
    const customerId = req.params.id;
    const startAt = new Date(req.body.startAt);
    const numGuests = req.body.numGuests;
    const notes = req.body.notes;

     // Validate numGuests before saving the reservation
    if (numGuests < 1) {
      throw new Error("There must be at least 1 guest.");
    }

    const reservation = new Reservation({
      customerId,
      startAt,
      numGuests,
      notes
    });
    await reservation.save();

    return res.redirect(`/${customerId}/`);
  } catch (err) {
    return next(err);
  }
});


// Show form to edit a reservation
router.get("/:customerId/reservations/:reservationId/edit/", async function (req, res, next) {
  try {
    const customer = await Customer.get(req.params.customerId);
    const reservations = await customer.getReservations();
    const reservation = reservations.find(r => r.id === parseInt(req.params.reservationId));

    if (!reservation) {
      throw new Error("Reservation not found.");
    }

    return res.render("reservation_edit_form.html", { customer, reservation });
  } catch (err) {
    return next(err);
  }
});

// Handle editing a reservation
router.post("/:customerId/reservations/:reservationId/edit/", async function (req, res, next) {
  try {
    const customer = await Customer.get(req.params.customerId);
    const reservations = await customer.getReservations();
    const reservation = reservations.find(r => r.id === parseInt(req.params.reservationId));

    if (!reservation) {
      throw new Error("Reservation not found.");
    }

    reservation.startAt = new Date(req.body.startAt);
    reservation.numGuests = req.body.numGuests;
    reservation.notes = req.body.notes;

    await reservation.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});




module.exports = router;
