const ActivityLog = require("../models/ActivityLog");

exports.createActivityLog = async (
    action,
    entityType,
    entityId,
    entityName,
    description
) => {

    await ActivityLog.create({
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        description,
    });
};
