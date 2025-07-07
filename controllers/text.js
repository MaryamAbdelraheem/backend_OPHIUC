exports.getAllAppointmentsWithDoctorInfo = async (req, res) => {
        const { id, role } = req.user;
        let appointments;

        if (role === 'doctor') {
            appointments = await Appointment.findAll({
                where: { doctor_id: id },
                include: [{ model: Patient, attributes: ['name', 'email'] }],
                order: [['appointment_date', 'ASC']]
            });
        } else if (role === 'patient') {
            appointments = await Appointment.findAll({
                where: { patient_id: id },
                include: [{ model: Doctor, attributes: ['name', 'specialty'] }],
                order: [['appointment_date', 'ASC']]
            });
        } else {
            return res.status(403).json({ message: "Access denied." });
        }

        const formattedAppointments = appointments.map(app => ({
        doctorName: `${app.Doctor.firstName} ${app.Doctor.lastName}`,
        specialization: app.Doctor.specialization, // ✅ الآن سيظهر بشكل صحيح
        date: app.appointment_date.toISOString().split('T')[0],
        time: app.appointment_date.toISOString().split('T')[1].slice(0, 5),
    }));

        res.status(200).json({
            status: "success",
            data: {
            appointments: formattedAppointments
        }
        });
};

exports.getAllAppointmentsWithDoctorInfo = asyncHandler(async (req, res) => {

        const { id, role } = req.user;
        let appointments;

        if (role === 'doctor') {
            appointments = await Appointment.findAll({
                where: { doctor_id: id },
                include: [{ model: Patient, attributes: ['firstName', 'lastName', 'email'] }],
                order: [['appointment_date', 'ASC']]
            });
        } else if (role === 'patient') {
            appointments = await Appointment.findAll({
                where: { patient_id: id },
                include: [{ model: Doctor, attributes: ['firstName', 'lastName', 'specialization'] }],
                order: [['appointment_date', 'ASC']]
            });
        } else {
            return res.status(403).json({ message: "Access denied." });
        }

        const formattedAppointments = appointments.map(app => {
            const date = app.appointment_date.toISOString().split('T')[0];
            const time = app.appointment_date.toISOString().split('T')[1].slice(0, 5);

            if (role === 'patient') {
                return {
                    doctorName: `${app.Doctor.firstName} ${app.Doctor.lastName}`,
                    specialization: app.Doctor.specialization,
                    date,
                    time,
                };
            } else {
                return {
                    patientName: `${app.Patient.firstName} ${app.Patient.lastName}`,
                    email: app.Patient.email,
                    date,
                    time,
                };
            }
        });

        res.status(200).json({
            status: "success",
            data: {
                appointments: formattedAppointments
            }
        });
});