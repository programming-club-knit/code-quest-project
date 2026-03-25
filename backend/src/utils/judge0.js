import axios from 'axios';

const getJudge0Config = () => {
    const baseUrl = (process.env.JUDGE0_URL || 'http://localhost:2358').replace(/\/+$/, '');
    const authToken = process.env.JUDGE0_AUTH_TOKEN || '';
    return { baseUrl, authToken };
};

// Language ID mappings for Judge0
export const LANGUAGE_IDS = {
    'c': 50,
    'cpp': 54,
    'python': 71,
    'java': 62,
    'javascript': 63,
};

export const submitCodeToJudge0 = async (code, languageId, input, expectedOutput, timeLimit, memoryLimit) => {
    try {
        const { baseUrl: JUDGE0_BASE_URL, authToken: JUDGE0_AUTH_TOKEN } = getJudge0Config();

        if (!JUDGE0_BASE_URL) {
            throw new Error('JUDGE0_URL is not configured.');
        }

        const headers = {
            'Content-Type': 'application/json',
        };

        if (JUDGE0_AUTH_TOKEN) {
            headers['Authorization'] = `Bearer ${JUDGE0_AUTH_TOKEN}`;
            headers['X-Auth-Token'] = JUDGE0_AUTH_TOKEN;
        }

        // Submit the code for execution
        const submissionRes = await axios.post(
            `${JUDGE0_BASE_URL}/submissions?wait=false`,
            {
                source_code: code,
                language_id: languageId,
                stdin: input,
                expected_output: expectedOutput,
                cpu_time_limit: timeLimit,
                memory_limit: memoryLimit
            },
            { headers, timeout: 15000 }
        );

        const token = submissionRes.data.token;
        if (!token) {
            throw new Error('Judge0 did not return a submission token.');
        }

        // Poll for result
        let result = null;
        let attempts = 0;
        const maxAttempts = 100; // Max 10 seconds of polling

        while (attempts < maxAttempts) {
            const statusRes = await axios.get(
                `${JUDGE0_BASE_URL}/submissions/${token}`,
                { headers, timeout: 15000 }
            );

            result = statusRes.data;

            // Status code: 1 = In Queue, 2 = Processing, > 2 = Completed
            if (result.status.id > 2) {
                break;
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
        }

        if (!result || !result.status || typeof result.status.id !== 'number') {
            throw new Error('Invalid response from Judge0.');
        }

        return result;
    } catch (error) {
        const details = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        console.error('Judge0 submission error:', details);
        throw new Error(`Judge0 unavailable or failed: ${details}`);
    }
};

// Get human-readable status message
export const getStatusMessage = (statusId) => {
    const statuses = {
        1: 'In Queue',
        2: 'Processing',
        3: 'Accepted',
        4: 'Wrong Answer',
        5: 'Time Limit Exceeded',
        6: 'Compilation Error',
        7: 'Runtime Error (SIGSEGV)',
        8: 'Runtime Error (SIGXFSZ)',
        9: 'Runtime Error (SIGFPE)',
        10: 'Runtime Error (SIGABRT)',
        11: 'Runtime Error (NZEC)',
        12: 'Runtime Error (Other)',
        13: 'Internal Error',
        14: 'Exec Format Error'
    };
    return statuses[statusId] || 'Unknown Status';
};
