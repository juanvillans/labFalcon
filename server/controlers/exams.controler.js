import { commonErrors, catchAsync } from "../middlewares/error.middleware.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import Analysis from "../models/analysis.model.js";
import Exams from "../models/exams.model.js";
import AnalysisExams from "../models/analysis_exams.model.js";
import { db } from "../database/postgre.js";

export const createExam = catchAsync(async (req, res, next) => {
  try {
    const { patient, tests, all_validated, method } = req.body;

    // Validate required fields
    if (!patient.ci) {
      throw commonErrors.missingFields(["Cédula de Identidad"]);
    }

    if (!patient.last_name) {
      throw commonErrors.missingFields(["Apellido"]);
    }

    if (!patient.first_name) {
      throw commonErrors.missingFields(["Nombre"]);
    }

    if (!patient.date_birth) {
      throw commonErrors.missingFields(["Fecha de Nacimiento"]);
    }

    if (!patient.email) {
      throw commonErrors.missingFields(["Correo Electrónico"]);
    }
    if (!patient.sex) {
      throw commonErrors.missingFields(["Género"]);
    }

    // Use database transaction
    const result = await db.transaction(async (trx) => {
      // Create the analysis within transaction
      const analysis = await Analysis.createWithTransaction(trx, {
        patient,
        all_validated: all_validated,
      });

      const analysisId = analysis.id;
      const analysis_exams_ids = [];

      // Create all exams within transaction

      for (const testKey in tests) {
        const test = tests[testKey];
        const exam = await Exams.createWithTransaction(trx, {
          tests_values: test.testValues,
          testTypeId: test.testTypeId,
          validated: test.validated,
          method: test.method,
          observation: test.observation
        });
        analysis_exams_ids.push(
          {analysis_id: analysisId, 
          id_exam: exam.id}
        );
      }

      // Create all analysis_exams relationships within transaction
      await AnalysisExams.createWithTransaction(trx, analysis_exams_ids);

      return analysis;
    });

    res.status(201).json({
      status: "success",
      message: "Examen creado con éxito",
      data: {
        analysis: result,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const getExams = catchAsync(async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 25,
      sortField = 'created_at',
      sortOrder = 'desc',
      filters,
      search = ''
    } = req.query;

    const offset = (page - 1) * limit;

    // Build base query for analyses
    let analysisQuery = db("analysis")
      .select(
        "*",
        db.raw("to_char(date_birth, 'YYYY-MM-DD') as date_birth"),
        db.raw("to_char(created_at, 'YYYY-MM-DD') as created_date"),
        db.raw("to_char(created_at, 'HH12:MI AM') as created_time")
      );

    // Apply global search if provided
    if (search && search.trim()) {
      analysisQuery = analysisQuery.where(function() {
        this.whereILike('first_name', `%${search}%`)
          .orWhereILike('last_name', `%${search}%`)
          .orWhereILike('ci', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
          .orWhereILike('phone_number', `%${search}%`);
      });
    }

    // Apply column-specific filters if provided
    if (filters) {
      try {
        const parsedFilters = JSON.parse(filters);
        Object.entries(parsedFilters).forEach(([field, value]) => {
          if (value && value.trim()) {
            // Handle nested field paths (e.g., "patient.first_name")
            if (field.includes('.')) {
              const fieldName = field.split('.')[1]; // Get the actual field name
              if (fieldName === 'first_name' || fieldName === 'last_name' || fieldName === 'ci' || fieldName === 'sex') {
                analysisQuery = analysisQuery.whereILike(fieldName, `%${value}%`);
              }
            } else {
              // Handle direct fields
              if (field === 'all_validated') {
                analysisQuery = analysisQuery.where(field, value === 'true');
              } else if (field === 'age') {
                // Handle age filtering (you might want to implement range filtering here)
                const ageValue = parseInt(value);
                if (!isNaN(ageValue)) {
                  analysisQuery = analysisQuery.whereRaw(
                    `EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_birth)) = ?`,
                    [ageValue]
                  );
                }
              } else if (field === 'message_status') {
                analysisQuery = analysisQuery.where(field, value);
              }
               else {
                analysisQuery = analysisQuery.whereILike(field, `%${value}%`);
              }
            }
          }
        });
      } catch (error) {
        console.error('Error parsing filters:', error);
      }
    }

    // Get total count for pagination
    const totalCountQuery = analysisQuery.clone().clearSelect().count('* as count').first();

    // Handle sorting with field mapping
    let actualSortField = sortField;

    // Map frontend field names to database field names
    const fieldMapping = {
      'id': 'id',
      'patient.first_name': 'first_name',
      'patient.last_name': 'last_name',
      'patient.ci': 'ci',
      'patient.sex': 'sex',
      'age': db.raw('EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_birth))'),
      'created_date': 'created_at',
      'created_time': 'created_at',
      'all_validated': 'all_validated'

    };

    if (fieldMapping[sortField]) {
      actualSortField = fieldMapping[sortField];
    }

    // Apply sorting and pagination
    const analyses = await analysisQuery
      .orderBy(actualSortField, sortOrder)
      .limit(parseInt(limit))
      .offset(offset);

    // Get analysis IDs for the current page
    const analysisIds = analyses.map(a => a.id);

    // Get all exams for these analyses with examination type information
    const examsData = analysisIds.length > 0 ? await db("analysis_exams")
      .join("exams", "analysis_exams.id_exam", "exams.id")
      .join("examination_types", "exams.examination_type_id", "examination_types.id")
      .whereIn("analysis_exams.analysis_id", analysisIds)
      .select(
        "analysis_exams.analysis_id",
        "exams.*",
        "examination_types.name as examination_type_name"
      ) : [];

    // Helper functions
    const calculateAge = (dateOfBirth) => {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    };

    const safeJsonParse = (jsonString) => {
      try {
        if (typeof jsonString === 'object' && jsonString !== null) {
          return jsonString;
        }
        if (typeof jsonString === 'string') {
          return JSON.parse(jsonString);
        }
        return {};
      } catch (error) {
        console.error('JSON parse error:', error, 'Input:', jsonString);
        return {};
      }
    };

    // Group exams by analysis_id
    const examsByAnalysis = examsData.reduce((acc, exam) => {
      if (!acc[exam.analysis_id]) acc[exam.analysis_id] = [];
      acc[exam.analysis_id].push(exam);
      return acc;
    }, {});

    // Combine data
    const result = analyses.map(analysis => ({
      id: analysis.id,
      patient: {
        ci: analysis.ci,
        first_name: analysis.first_name,
        last_name: analysis.last_name,
        date_birth: analysis.date_birth,
        email: analysis.email,
        phone_number: analysis.phone_number,
        address: analysis.address,
        sex: analysis.sex,
        patient_id: null
      },
      all_validated: analysis.all_validated,
      message_status: analysis.message_status,
      created_date: analysis.created_date,
      created_time: analysis.created_time,
      age: calculateAge(analysis.date_birth),
      tests: (examsByAnalysis[analysis.id] || []).reduce((acc, exam) => {
        acc[exam.examination_type_id] = {
          testValues: safeJsonParse(exam.tests_values),
          testTypeName: exam.examination_type_name,
          testTypeId: exam.examination_type_id,
          validated: exam.validated,
          method: exam.method,
          observation: exam.observation
        };
        return acc;
      }, {})
    }));

    const { count } = await totalCountQuery;

    res.status(200).json({
      status: "success",
      data: {
        exams: result,
        totalCount: parseInt(count),
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        // Debug information (remove in production)
        debug: {
          searchTerm: search,
          appliedFilters: filters ? JSON.parse(filters) : {},
          sortField: actualSortField,
          sortOrder,
          recordsOnPage: result.length
        }
      },
    });
  } catch (error) {
    next(error);
  }
});

export const findExamById = catchAsync(async (req, res, next) => {
  try {
    const exam = await Exams.findById(req.params.id);
    if (!exam) {
      throw commonErrors.notFound("Exam");
    }
    res.status(200).json({
      status: "success",
      data: {
        exam,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const updateExam = catchAsync(async (req, res, next) => {
  try {
    const analysisId = req.params.id; // This is the analysis ID, not exam ID
    const { patient, tests, all_validated } = req.body;

    // Validate required fields
    if (!patient.ci) {
      throw commonErrors.missingFields(["Cédula de Identidad"]);
    }

    if (!patient.last_name) {
      throw commonErrors.missingFields(["Apellido"]);
    }

    if (!patient.first_name) {
      throw commonErrors.missingFields(["Nombre"]);
    }

    if (!patient.date_birth) {
      throw commonErrors.missingFields(["Fecha de Nacimiento"]);
    }

    if (!patient.email) {
      throw commonErrors.missingFields(["Correo Electrónico"]);
    }

    // Check if analysis exists
    const existingAnalysis = await db("analysis").where("id", analysisId).first();
    if (!existingAnalysis) {
      throw commonErrors.notFound("Analysis");
    }

    // Use database transaction for data integrity
    const result = await db.transaction(async (trx) => {
      // Step 1: Update the analysis within transaction
      const updates = {
        ci: patient.ci,
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_birth: patient.date_birth,
        email: patient.email,
        phone_number: patient.phone_number,
        address: patient.address,
        sex: patient.sex,
        all_validated: all_validated,
        updated_at: trx.fn.now()
      };

      const [updatedAnalysis] = await trx("analysis")
        .where("id", analysisId)
        .update(updates)
        .returning("*");

      // Step 2: Delete old relationships and get exam IDs to delete
      const existingExamIds = await AnalysisExams.deleteByAnalysisIdWithTransaction(trx, analysisId);

      // Step 3: Delete old exams using model method
      await Exams.deleteMultipleWithTransaction(trx, existingExamIds);

      // Step 5: Create new exams using the model method
      const analysis_exams_ids = [];

      // Create all exams within transaction
      for (const testKey in tests) {
        const test = tests[testKey];
        const exam = await Exams.createWithTransaction(trx, {
          tests_values: test.testValues,
          testTypeId: test.testTypeId,
          validated: test.validated,
          method: test.method,
          observation: test.observation
        });
        analysis_exams_ids.push(
          {analysis_id: analysisId, 
          id_exam: exam.id}
        );
      }

      // Step 6: Create new analysis_exams relationships using the model method
      await AnalysisExams.createWithTransaction(trx, analysis_exams_ids);

      return updatedAnalysis;
    });

    res.status(200).json({
      status: "success",
      message: "Examen actualizado con éxito",
      data: {
        analysis: result,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const deleteExam = catchAsync(async (req, res, next) => {
  try {
    const analysisId = req.params.id; // This is the analysis ID

    // Check if analysis exists
    const existingAnalysis = await db("analysis").where("id", analysisId).first();
    if (!existingAnalysis) {
      throw commonErrors.notFound("Analysis");
    }

    // Use database transaction for data integrity
    await db.transaction(async (trx) => {
      // Step 1: Delete relationships and get exam IDs using model method
      const existingExamIds = await AnalysisExams.deleteByAnalysisIdWithTransaction(trx, analysisId);

      // Step 2: Delete exams using model method
      await Exams.deleteMultipleWithTransaction(trx, existingExamIds);

      // Step 3: Delete the analysis
      await trx("analysis")
        .where("id", analysisId)
        .del();
    });

    res.status(200).json({
      status: "success",
      message: "Examen eliminado con éxito",
    });
  } catch (error) {
    next(error);
  }
});

export const validateExam = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      throw commonErrors.missingFields(["id"]);
    }
    await Exams.updateById(id, { all_validated: true });
    res.status(200).json({
      status: "success",
      message: "Examen validado con éxito",
    });
  } catch (error) {
    next(error);
  }
});

export const getChartData = catchAsync(async (req, res, next) => {
  console.log(req.params);
  try {
    const { period } = req.params;

    const total = await Exams.getDetailedCountByPeriod(period);
    const perType = await Exams.getTotalPerExaminationTypeByPeriod(period);
    const analyses = await Analysis.getChartDataByPeriod(period);

    res.status(200).json({
      status: "success",
      data: {
        total,
        perType,
        analyses,
      },
    });
  } catch (error) {
    next(error);
  }
});


