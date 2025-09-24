import { db } from "../database/postgre.js";

class Origin {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
  }

  static async getAll() {
    const origins = await db("origins").orderBy("name");
    return origins.map(o => new Origin(o));
  }

  static async getStatsForPeriod(period) {
    let query = db("analysis")
      .join("origins", "analysis.origin_id", "origins.id")
      .select(
        "origins.name as label", "origins.name as id",
        db.raw("COUNT(*) as value")
      )
      .groupBy("origins.id", "origins.name");

    const today = new Date();
    if (period === "week") {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      query = query.where("analysis.created_at", ">=", weekAgo);
    } else if (period === "month") {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      query = query.where("analysis.created_at", ">=", monthAgo);
    }

    return await query;
  }
}

export default Origin;