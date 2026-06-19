module.exports = (sequelize, Sequelize) => {
  const LabourAttendance = sequelize.define("labour_attendance", {
    clock_in_time: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    clock_out_time: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    duration_minutes: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "Total duration in minutes"
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'clocked_in', // clocked_in, clocked_out
    },
    labour_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    project_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    }
  });

  return LabourAttendance;
};