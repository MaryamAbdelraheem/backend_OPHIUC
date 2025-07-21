// Dealing with the database
// repositories/patient.repository.js
const { Patient } = require('../models');

class PatientRepository {
  async findById(id, withPassword = false) {
    const attributes = withPassword ? undefined : { exclude: ['password'] };
    return await Patient.findByPk(id, { attributes });
  }
async findByEmail(email) {
  return await Patient.findOne({ where: { email } });
}

async updatePassword(patientId, hashedPassword) {
  return await Patient.update(
    { password: hashedPassword },
    { where: { patientId } }
  );
}
  async updateById(id, updates) {
    const patient = await Patient.findByPk(id);
    if (!patient) return null;

    for (const key in updates) {
      if (updates[key] !== undefined) {
        patient[key] = updates[key];
      }
    }

    return await patient.save();
  }

  async findPatientsByDoctorId(doctorId) {
    return await Patient.findAll({
        where: { doctorId },
        attributes: ['patientId', 'firstName', 'lastName', 'email', 'img']
    });
  }

  async findPatientForDoctor(doctorId, patientId) {
    return await Patient.findOne({
        where: { doctorId, patientId },
        attributes: ['patientId', 'firstName', 'lastName', 'img']
    });
  }
}

module.exports = new PatientRepository();