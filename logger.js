const fs = require('fs');
const path = require('path');
const colors = require('colors');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, 'logs');
        this.createLogDirectory();
        this.logFile = path.join(this.logDir, `discord-checker-${this.getDateString()}.log`);
    }

    createLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getDateString() {
        const now = new Date();
        return now.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    getTimestamp() {
        return new Date().toISOString();
    }

    formatMessage(level, category, message, data = null) {
        const timestamp = this.getTimestamp();
        let logMessage = `[${timestamp}] [${level.toUpperCase()}] [${category}] ${message}`;
        
        if (data) {
            logMessage += ` | Data: ${JSON.stringify(data)}`;
        }
        
        return logMessage;
    }

    writeToFile(message) {
        try {
            fs.appendFileSync(this.logFile, message + '\n', 'utf8');
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }

    info(category, message, data = null) {
        const logMessage = this.formatMessage('INFO', category, message, data);
        console.log(`${'[INFO]'.cyan} ${message}${data ? ` ${JSON.stringify(data)}` : ''}`);
        this.writeToFile(logMessage);
    }

    success(category, message, data = null) {
        const logMessage = this.formatMessage('SUCCESS', category, message, data);
        console.log(`${'[SUCCESS]'.green} ${message}${data ? ` ${JSON.stringify(data)}` : ''}`);
        this.writeToFile(logMessage);
    }

    warning(category, message, data = null) {
        const logMessage = this.formatMessage('WARNING', category, message, data);
        console.log(`${'[WARNING]'.yellow} ${message}${data ? ` ${JSON.stringify(data)}` : ''}`);
        this.writeToFile(logMessage);
    }

    error(category, message, error = null, data = null) {
        const errorData = {
            ...data,
            error: error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : null
        };
        
        const logMessage = this.formatMessage('ERROR', category, message, errorData);
        console.log(`${'[ERROR]'.red} ${message}${error ? ` - ${error.message}` : ''}`);
        this.writeToFile(logMessage);
    }

    debug(category, message, data = null) {
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
            const logMessage = this.formatMessage('DEBUG', category, message, data);
            console.log(`${'[DEBUG]'.gray} ${message}${data ? ` ${JSON.stringify(data)}` : ''}`);
            this.writeToFile(logMessage);
        }
    }

    // Security logging for sensitive operations
    security(category, message, data = null) {
        // Remove sensitive data for security logs
        const sanitizedData = this.sanitizeData(data);
        const logMessage = this.formatMessage('SECURITY', category, message, sanitizedData);
        console.log(`${'[SECURITY]'.magenta} ${message}`);
        this.writeToFile(logMessage);
    }

    // Audit logging for important events
    audit(category, action, userId = null, data = null) {
        const auditData = {
            action,
            userId: userId ? this.maskUserId(userId) : null,
            timestamp: this.getTimestamp(),
            ...this.sanitizeData(data)
        };
        
        const logMessage = this.formatMessage('AUDIT', category, `Action: ${action}`, auditData);
        this.writeToFile(logMessage);
        
        // Also write to separate audit file
        const auditFile = path.join(this.logDir, `audit-${this.getDateString()}.log`);
        try {
            fs.appendFileSync(auditFile, logMessage + '\n', 'utf8');
        } catch (error) {
            this.error('LOGGER', 'Failed to write audit log', error);
        }
    }

    // Authentication specific logging
    authAttempt(email, success, reason = null, mfaRequired = false) {
        const data = {
            email: this.maskEmail(email),
            success,
            reason,
            mfaRequired,
            timestamp: this.getTimestamp()
        };
        
        if (success) {
            this.security('AUTH', 'Authentication successful', data);
        } else {
            this.security('AUTH', 'Authentication failed', data);
        }
    }

    // Account checking logging
    accountCheck(identifier, success, dataTypes = [], error = null) {
        const data = {
            identifier: this.maskEmail(identifier),
            success,
            dataTypes,
            timestamp: this.getTimestamp()
        };
        
        if (success) {
            this.audit('ACCOUNT_CHECK', 'Account information retrieved', null, data);
        } else {
            this.error('ACCOUNT_CHECK', 'Account check failed', error, data);
        }
    }

    // Rate limiting logging
    rateLimited(endpoint, email = null) {
        const data = {
            endpoint,
            email: email ? this.maskEmail(email) : null,
            timestamp: this.getTimestamp()
        };
        
        this.warning('RATE_LIMIT', 'Rate limit encountered', data);
    }

    // Token usage logging
    tokenUsage(action, success, error = null) {
        const data = {
            action,
            success,
            timestamp: this.getTimestamp()
        };
        
        this.audit('TOKEN_USAGE', action, null, data);
        
        if (!success && error) {
            this.error('TOKEN_USAGE', `Token usage failed: ${action}`, error);
        }
    }

    // Bulk operation logging
    bulkOperation(operation, totalCount, successCount, failureCount) {
        const data = {
            operation,
            totalCount,
            successCount,
            failureCount,
            successRate: totalCount > 0 ? (successCount / totalCount * 100).toFixed(2) + '%' : '0%',
            timestamp: this.getTimestamp()
        };
        
        this.audit('BULK_OPERATION', operation, null, data);
        this.info('BULK_OPERATION', `Completed ${operation}: ${successCount}/${totalCount} successful`, data);
    }

    // Data sanitization
    sanitizeData(data) {
        if (!data) return null;
        
        const sanitized = { ...data };
        
        // Remove sensitive fields
        const sensitiveFields = ['password', 'token', 'mfa_code', 'totp', 'backup_code'];
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });
        
        // Mask email if present
        if (sanitized.email) {
            sanitized.email = this.maskEmail(sanitized.email);
        }
        
        // Mask user ID if present
        if (sanitized.userId) {
            sanitized.userId = this.maskUserId(sanitized.userId);
        }
        
        return sanitized;
    }

    maskEmail(email) {
        if (!email || typeof email !== 'string') return email;
        
        const [username, domain] = email.split('@');
        if (!username || !domain) return email;
        
        const maskedUsername = username.length > 2 
            ? username.substring(0, 2) + '*'.repeat(username.length - 2)
            : username;
            
        return `${maskedUsername}@${domain}`;
    }

    maskUserId(userId) {
        if (!userId || typeof userId !== 'string') return userId;
        
        return userId.length > 4 
            ? userId.substring(0, 4) + '*'.repeat(userId.length - 4)
            : userId;
    }

    // Get log statistics
    getLogStats() {
        try {
            const logContent = fs.readFileSync(this.logFile, 'utf8');
            const lines = logContent.split('\n').filter(line => line.trim());
            
            const stats = {
                totalEntries: lines.length,
                info: 0,
                success: 0,
                warning: 0,
                error: 0,
                security: 0,
                audit: 0,
                debug: 0
            };
            
            lines.forEach(line => {
                if (line.includes('[INFO]')) stats.info++;
                else if (line.includes('[SUCCESS]')) stats.success++;
                else if (line.includes('[WARNING]')) stats.warning++;
                else if (line.includes('[ERROR]')) stats.error++;
                else if (line.includes('[SECURITY]')) stats.security++;
                else if (line.includes('[AUDIT]')) stats.audit++;
                else if (line.includes('[DEBUG]')) stats.debug++;
            });
            
            return stats;
        } catch (error) {
            this.error('LOGGER', 'Failed to get log statistics', error);
            return null;
        }
    }

    // Export logs
    exportLogs(outputPath) {
        try {
            const stats = this.getLogStats();
            const exportData = {
                exportTimestamp: this.getTimestamp(),
                logFile: this.logFile,
                statistics: stats,
                logs: fs.readFileSync(this.logFile, 'utf8').split('\n').filter(line => line.trim())
            };
            
            fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
            this.info('LOGGER', `Logs exported to ${outputPath}`);
            return true;
        } catch (error) {
            this.error('LOGGER', 'Failed to export logs', error);
            return false;
        }
    }

    // Clean old logs (older than specified days)
    cleanOldLogs(daysToKeep = 30) {
        try {
            const files = fs.readdirSync(this.logDir);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            let deletedCount = 0;
            
            files.forEach(file => {
                const filePath = path.join(this.logDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                }
            });
            
            this.info('LOGGER', `Cleaned ${deletedCount} old log files`);
            return deletedCount;
        } catch (error) {
            this.error('LOGGER', 'Failed to clean old logs', error);
            return 0;
        }
    }
}

module.exports = Logger;