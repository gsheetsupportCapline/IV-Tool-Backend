const OfficeDataRepository = require('../repository/officeData-repository');

const OfficeDataService = {
  getOfficeDataByDateRange: async (fromDate, toDate, dateType) => {
    try {
      // Map dateType to actual field names in database
      const dateFieldMapping = {
        appointmentDate: 'appointments.appointmentDate',
        completedDate: 'appointments.ivCompletedDate',
        ivRequestedDate: 'appointments.ivRequestedDate',
        ivAssignedDate: 'appointments.ivAssignedDate',
      };

      const dateFieldName = dateFieldMapping[dateType];
      if (!dateFieldName) {
        throw new Error('Invalid dateType provided');
      }

      // Get data from repository
      const officeData = await OfficeDataRepository.getOfficeDataByDateRange(
        fromDate,
        toDate,
        dateFieldName
      );

      // Process and format the data
      const processedData = officeData.map((appointment) => ({
        officeName: appointment.officeName,
        appointmentId: appointment._id,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        patientDOB: appointment.patientDOB,
        insuranceName: appointment.insuranceName,
        insurancePhone: appointment.insurancePhone,
        policyHolderName: appointment.policyHolderName,
        policyHolderDOB: appointment.policyHolderDOB,
        memberId: appointment.memberId,
        employerName: appointment.employerName,
        groupNumber: appointment.groupNumber,
        relationWithPatient: appointment.relationWithPatient,
        medicaidId: appointment.medicaidId,
        carrierId: appointment.carrierId,
        confirmationStatus: appointment.confirmationStatus,
        cellPhone: appointment.cellPhone,
        homePhone: appointment.homePhone,
        workPhone: appointment.workPhone,
        appointmentType: appointment.appointmentType,
        ivType: appointment.ivType,
        status: appointment.status,
        completionStatus: appointment.completionStatus,
        assignedUser: appointment.assignedUser, // Keep the original ID for reference
        assignedUserName: appointment.assignedUserName, // Add the user name
        ivRemarks: appointment.ivRemarks,
        source: appointment.source,
        planType: appointment.planType,
        completedBy: appointment.completedBy,
        noteRemarks: appointment.noteRemarks,
        ivRequestedDate: appointment.ivRequestedDate,
        ivAssignedDate: appointment.ivAssignedDate,
        ivCompletedDate: appointment.ivCompletedDate,
        ivAssignedByUserName: appointment.ivAssignedByUserName,
        provider: appointment.provider,
        imageUrl: appointment.imageUrl,
      }));

      return {
        totalRecords: processedData.length,
        dateType: dateType,
        appointments: processedData,
      };
    } catch (error) {
      console.error(
        'Error at OfficeDataService.getOfficeDataByDateRange:',
        error
      );
      throw error;
    }
  },
};

module.exports = OfficeDataService;
