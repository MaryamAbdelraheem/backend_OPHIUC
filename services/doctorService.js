const bcrypt = require('bcryptjs');
const ApiError = require('../utils/errors/ApiError');
const doctorRepository = require('../repositories/doctorRepository');
const patientRepository = require('../repositories/patientRepository');

class DoctorService {
  // [1] Get all doctors
  async getAllDoctors() {
    const doctors = await doctorRepository.findAllDoctors();
    if (!doctors.length) {
      throw new ApiError('No doctors found', 404);
    }
    return doctors;
  }

  // [2] Delete doctor by ID
  async deleteDoctor(id) {
    const doctor = await doctorRepository.findDoctorById(id);
    if (!doctor) {
      throw new ApiError('Doctor not found', 404);
    }
    await doctor.destroy(); // or use soft delete logic if needed
  }

  // [3] Get doctor patients
  async getDoctorPatients(doctorId) {
    const doctor = await doctorRepository.findDoctorNameById(doctorId);
    if (!doctor) throw new ApiError("Doctor not found", 404);

    const patients = await patientRepository.findPatientsByDoctorId(doctorId);
    if (!patients || patients.length === 0) {
      throw new ApiError("No patients found for this doctor", 404);
    }

    return {
      statusCode: 200,
      response: {
        status: 'success',
        message: "Doctor's patients fetched successfully",
        data: { doctor, patients }
      }
    };
  }

  // [4] Get specific patient profile for a doctor
  async getPatientProfileForDoctor(doctorId, patientId) {
    const doctor = await doctorRepository.findDoctorNameById(doctorId);
    if (!doctor) throw new ApiError("Doctor not found", 404);

    const patient = await patientRepository.findPatientForDoctor(doctorId, patientId);
    if (!patient) throw new ApiError("Patient not found for this doctor", 404);

    return {
      statusCode: 200,
      response: {
        status: 'success',
        message: "Patient profile fetched successfully",
        data: { doctor, patient }
      }
    };
  }
}

module.exports = new DoctorService();