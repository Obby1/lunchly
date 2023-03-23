/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    // this.customerId = customerId;
    // this._customerId = customerId || "";
    this._customerId = customerId;
    // this.numGuests = numGuests;
    this._numGuests = numGuests || "";
    // this.startAt = startAt;
    this._startAt = startAt || "";
    // this.notes = notes;
    this._notes = notes || "";
  }

  get notes() {
    return this._notes;
  }
  
  set notes(value) {
    this._notes = value || "";
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  get startAt() {
    return this._startAt;
  }

  set startAt(value) {
    if (!(value instanceof Date)) {
      throw new Error("Start date must be a Date object.");
    }
    this._startAt = value;
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );
    console.log(results.rows);
    return results.rows.map(row => new Reservation(row));
  }

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET customer_id=$1, num_guests=$2, start_at=$3, notes=$4
             WHERE id=$5`,
        [this.customerId, this.numGuests, this.startAt, this.notes, this.id]
      );
    }
  }

  get numGuests() {
    return this._numGuests;
  }


  // below is a project requirement but it will not be ran as there are existing db constraint checks
  // added an error message on the route handler itself to display the same error message
  set numGuests(value) {
    if (value < 1) {
      throw new Error("There must be at least 1 guest.");
    }
    this._numGuests = value;
  }

  get customerId() {
    return this._customerId;
  }

  set customerId(value) {
    if (this._customerId !== undefined) {
      throw new Error("Cannot change customerId once it is assigned.");
    }
    this._customerId = value;
  }
  

}


module.exports = Reservation;
