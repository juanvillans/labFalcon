# Server-Side Table Implementation Guide

## Frontend Implementation ✅ COMPLETED

The frontend is now configured for complete server-side operations:

### Features Implemented:
- ✅ **Server-side pagination** 
- ✅ **Server-side sorting**
- ✅ **Server-side column filtering**
- ✅ **Server-side global search**
- ✅ **Debounced search** (300ms delay)
- ✅ **Loading states**
- ✅ **Row count tracking**

### API Request Parameters

The frontend now sends these parameters to `/exams` endpoint:

```javascript
{
  page: 1,                    // Current page (1-based)
  limit: 25,                  // Items per page (25, 50, or 100)
  sortField: "id",            // Field to sort by
  sortOrder: "asc",           // "asc" or "desc"
  search: "search term",      // Global search term
  filters: JSON.stringify({   // Column-specific filters
    "patient.first_name": "John",
    "allValidated": "true",
    // ... other column filters
  })
}
```

## Backend Implementation Required

### 1. Update Exams Controller

```javascript
// Example implementation for Node.js/Express
app.get('/exams', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      sortField = 'id',
      sortOrder = 'asc',
      search = '',
      filters = '{}'
    } = req.query;

    // Parse filters
    const columnFilters = JSON.parse(filters);
    
    // Build query
    let query = {};
    let sort = {};
    
    // Global search across multiple fields
    if (search) {
      query.$or = [
        { 'patient.first_name': { $regex: search, $options: 'i' } },
        { 'patient.last_name': { $regex: search, $options: 'i' } },
        { 'patient.ci': { $regex: search, $options: 'i' } },
        { 'examination_type_name': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Column-specific filters
    Object.keys(columnFilters).forEach(key => {
      const value = columnFilters[key];
      if (value) {
        if (key === 'allValidated') {
          query[key] = value === 'true';
        } else if (key === 'age') {
          // Handle range filters
          query[key] = { $gte: parseInt(value) };
        } else {
          query[key] = { $regex: value, $options: 'i' };
        }
      }
    });
    
    // Sorting
    sort[sortField] = sortOrder === 'desc' ? -1 : 1;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const [exams, totalCount] = await Promise.all([
      Exam.find(query)
        .populate('patient')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Exam.countDocuments(query)
    ]);
    
    res.json({
      exams,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit))
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Database Indexes (for performance)

```javascript
// Add these indexes to your database
db.exams.createIndex({ "patient.first_name": "text" });
db.exams.createIndex({ "patient.last_name": "text" });
db.exams.createIndex({ "patient.ci": 1 });
db.exams.createIndex({ "created_date": -1 });
db.exams.createIndex({ "allValidated": 1 });
db.exams.createIndex({ "examination_type_name": 1 });

// Compound index for common queries
db.exams.createIndex({ 
  "created_date": -1, 
  "allValidated": 1,
  "patient.ci": 1 
});
```

### 3. SQL Implementation (if using SQL database)

```sql
-- Example for PostgreSQL
SELECT 
  e.*,
  p.first_name,
  p.last_name,
  p.ci,
  COUNT(*) OVER() as total_count
FROM exams e
JOIN patients p ON e.patient_id = p.id
WHERE 
  -- Global search
  (
    CASE WHEN $search != '' THEN
      p.first_name ILIKE '%' || $search || '%' OR
      p.last_name ILIKE '%' || $search || '%' OR
      p.ci ILIKE '%' || $search || '%' OR
      e.examination_type_name ILIKE '%' || $search || '%'
    ELSE TRUE END
  )
  -- Column filters
  AND (CASE WHEN $first_name_filter != '' THEN p.first_name ILIKE '%' || $first_name_filter || '%' ELSE TRUE END)
  AND (CASE WHEN $validated_filter != '' THEN e.all_validated = $validated_filter::boolean ELSE TRUE END)
ORDER BY 
  CASE WHEN $sort_field = 'id' AND $sort_order = 'asc' THEN e.id END ASC,
  CASE WHEN $sort_field = 'id' AND $sort_order = 'desc' THEN e.id END DESC,
  CASE WHEN $sort_field = 'created_date' AND $sort_order = 'asc' THEN e.created_date END ASC,
  CASE WHEN $sort_field = 'created_date' AND $sort_order = 'desc' THEN e.created_date END DESC
LIMIT $limit OFFSET $offset;
```

## Performance Benefits

### Before (Client-side):
- ❌ Load ALL records from database
- ❌ Transfer large datasets over network
- ❌ Browser memory issues with large datasets
- ❌ Slow filtering/sorting on large data

### After (Server-side):
- ✅ Load only needed records (25-100 per page)
- ✅ Minimal network transfer
- ✅ Database-optimized queries
- ✅ Fast filtering/sorting with indexes
- ✅ Scalable to millions of records

## Testing the Implementation

1. **Test pagination**: Navigate through pages
2. **Test sorting**: Click column headers
3. **Test global search**: Type in search box
4. **Test column filters**: Use individual column filters
5. **Test performance**: Monitor network requests in DevTools

The frontend is ready - just implement the backend endpoint with the parameters shown above!
