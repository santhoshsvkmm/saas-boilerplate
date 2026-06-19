var express = require('express');
var router = express.Router();

const withAuth = require('../middleware/withAuth.middleware.js');
const validate = require('../middleware/validate.middleware.js');
const { cacheMiddleware } = require('../middleware/cache.middleware.js');
const { getCriticalPath, getNonCriticalTasks, getPhaseSlackSummary, cloneProjectVersion, compareProjectVersions } = require('../validationSchemas/projectVersion.validation.js');

const projectVersion = require("../controllers/projectVersion.controller.js");

// Get the critical path for a project version
router.get('/:id/critical-path', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getCriticalPath), (req, res, next) => cacheMiddleware(`critical-path-for-version:${req.params.id}`)(req, res, next), projectVersion.getCriticalPath);

// Get tasks with slack (non-critical) for a project version
router.get('/:id/non-critical-tasks', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getNonCriticalTasks), (req, res, next) => cacheMiddleware(`non-critical-tasks-for-version:${req.params.id}`)(req, res, next), projectVersion.getNonCriticalTasks);

// Get a summary of slack for each phase in a project version
router.get('/:id/phase-slack-summary', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(getPhaseSlackSummary), (req, res, next) => cacheMiddleware(`phase-slack-summary-for-version:${req.params.id}`)(req, res, next), projectVersion.getPhaseSlackSummary);

// Clone a project version to create a new revision
router.post('/:id/clone', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(cloneProjectVersion), projectVersion.clone);

// Compare two project versions to see what tasks have changed
router.get('/compare/:sourceVersionId/with/:targetVersionId', withAuth.verifyToken, withAuth.withRoleAdminOrManager, validate(compareProjectVersions), projectVersion.compareVersions);

module.exports = router;