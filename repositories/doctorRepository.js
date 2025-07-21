const { Doctor } = require('../models');

class DoctorRepository {
  async findAllDoctors() {
    return await Doctor.findAll({ attributes: { exclude: ['password'] } });
  }

  async findDoctorByEmail(email) {
    return await Doctor.findOne({ where: { email } });
  }

async findByEmail(email) {
  return await Doctor.findOne({ where: { email } });
}

async updatePassword(doctorId, hashedPassword) {
  return await Doctor.update(
    { password: hashedPassword },
    { where: { doctorId } }
  );
}

  async createDoctor(doctorData) {
    return await Doctor.create(doctorData);
  }

  async findDoctorById(id) {
    return await Doctor.findByPk(id, {
      attributes: { exclude: ['email', 'password', 'createdAt', 'updatedAt', 'deletedAt'] }
    });
  }

  async deleteDoctor(doctorInstance) {
    return await doctorInstance.destroy();
  }

  async findDoctorNameById(id) {
    return await Doctor.findByPk(id, {
      attributes: ['firstName', 'lastName']
    });
  }
}

module.exports = new DoctorRepository();