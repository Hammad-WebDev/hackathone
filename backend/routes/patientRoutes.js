import express from "express";
import Joi from "joi";
import Patient from "../models/patientModel.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const patientRoutes = express.Router();

const patientCreateSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  age: Joi.number().integer().min(0).max(130).required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  bloodGroup: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-").required(),
  disease: Joi.string().max(200).required(),
});

const patientUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  age: Joi.number().integer().min(0).max(130),
  gender: Joi.string().valid("male", "female", "other"),
  bloodGroup: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
  disease: Joi.string().max(200),
}).min(1);

const validateBody = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      message: error.details.map((item) => item.message.replaceAll('"', "")).join(", "),
      patient: null,
      code: 400,
    });
  }
  req.body = value;
  next();
};

// add patient
patientRoutes.post(
  "/create-patient",
  verifyToken,
  authorizeRoles("admin"),
  validateBody(patientCreateSchema),
  async (req, res) => {
    try {
      const newPatient = new Patient(req.body);
      await newPatient.save();

      res.status(201).json({
        message: "patient created successfully",
        patient: newPatient,
        code: 201,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        patient: null,
        code: 500,
      });
    }
  }
);

// get all patients
patientRoutes.get("/get-all-patients", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const patients = await Patient.find({}, { __v: 0 }).lean();
    res.status(200).json({
      message: "patients fetched successfully",
      patients,
      code: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      patients: null,
      code: 500,
    });
  }
});

// update patient
patientRoutes.put(
  "/update-patient/:id",
  verifyToken,
  authorizeRoles("admin"),
  validateObjectId("patient"),
  validateBody(patientUpdateSchema),
  async (req, res) => {
    try {
      const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        projection: { __v: 0 },
      }).lean();

      if (!updatedPatient) {
        return res.status(404).json({
          message: "patient not found",
          patient: null,
          code: 404,
        });
      }

      res.status(200).json({
        message: "patient updated successfully",
        patient: updatedPatient,
        code: 200,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        patient: null,
        code: 500,
      });
    }
  }
);

// delete patient
patientRoutes.delete(
  "/delete-patient/:id",
  verifyToken,
  authorizeRoles("admin"),
  validateObjectId("patient"),
  async (req, res) => {
    try {
      const deletedPatient = await Patient.findByIdAndDelete(req.params.id).lean();
      if (!deletedPatient) {
        return res.status(404).json({
          message: "patient not found",
          patient: null,
          code: 404,
        });
      }

      res.status(200).json({
        message: "patient deleted successfully",
        patient: deletedPatient,
        code: 200,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        patient: null,
        code: 500,
      });
    }
  }
);

export default patientRoutes;
