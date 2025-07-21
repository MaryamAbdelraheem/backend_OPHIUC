
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/errors/ApiError');
const patientRepo = require('../repositories/patientRepository');

class PatientService {
  async updateProfile(reqUserId, patientId, data) {
    if (reqUserId !== Number(patientId)) {
      throw new ApiError("Unauthorized access", 403);
    }

    const patient = await patientRepo.findById(patientId, true);
    if (!patient) {
      throw new ApiError("Patient not found", 404);
    }

    const {
      password,
      firstName, lastName, email, phoneNumber,
      medicalHistory, age, height, weight, gender, img
    } = data;

    const fieldsToUpdate = {
      firstName, lastName, email, phoneNumber,
      medicalHistory, age, height, weight, gender, img
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      fieldsToUpdate.password = await bcrypt.hash(password, salt);
    }

    const updatedPatient = await patientRepo.updateById(patientId, fieldsToUpdate);
    const patientData = updatedPatient.toJSON();
    delete patientData.password;

    return patientData;
  }

  async getProfile(patientId) {
    const patient = await patientRepo.findById(patientId);
    if (!patient) {
      throw new ApiError("Patient not found", 404);
    }

    return patient;
  }
}



module.exports = new PatientService();