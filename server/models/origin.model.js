import { db } from "../database/postgre.js";

class Origin {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
  }

  static async getAll() {
    const origins = await db("origins").orderBy("name");
    return origins.map((o) => new Origin(o));
  }

  static async getStatsForPeriod(period, start_date, end_date) {
    let query = db("analysis")
      .join("origins", "analysis.origin_id", "origins.id")
      .select(
        "origins.name as label",
        "origins.name as id",
        db.raw("COUNT(*) as value")
      )
      .groupBy("origins.id", "origins.name");

    const today = new Date();

    switch (period) {
      case "today":
        query.where("created_at", ">=", new Date(today.setHours(0, 0, 0, 0)));
        break;
      case "this_week":
        const startOfWeek = new Date(
          today.setDate(today.getDate() - today.getDay())
        );
        startOfWeek.setHours(0, 0, 0, 0);
        query.where("created_at", ">=", startOfWeek);
        break;
      case "this_month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        query.where("created_at", ">=", startOfMonth);
        break;
      case "this_year":
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        startOfYear.setHours(0, 0, 0, 0);
        query.where("created_at", ">=", startOfYear);
        break;
      case "range":
        query.whereBetween("created_at", [start_date, end_date]);
        break;
      default:
        throw new Error("Invalid period specified");
    }
    return await query;
  }
}

export default Origin;
