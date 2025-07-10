const cron = require('node-cron');
const { updatePackageEarnings } = require('../controllers/agentController');
const logger = require('./logger');

// Run every day at 00:01 AM
const schedulePackageUpdates = () => {
    cron.schedule('1 0 * * *', async () => {
        try {
            logger.info('Running scheduled package earnings update...');
            await updatePackageEarnings();
            logger.info('Successfully updated package earnings');
        } catch (error) {
            logger.error('Error in scheduled package update:', error);
        }
    });

    logger.info('Package earnings scheduler initialized');
};

module.exports = {
    schedulePackageUpdates
};
