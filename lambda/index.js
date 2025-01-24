/**
 * Function to process and return feedback details.
 * @param {Object} event - The event object containing the request data.
 * @param {Object} context - The context object (not used in this case).
 * @returns {Object} - Response object containing feedback data in JSON format.
 */
const execute = async (event, context) => {
    // Initialize variables
    let websiteLink = '';
    let feedbackPoints = [];
    let competitors = '';
    let specificResult = '';
    let painPoints = '';
    let specificBenefit = '';

    // Parse request body if present
    if (event?.body) {
        const { context: agentContext } = JSON.parse(event.body);

        // Extract variables from agentContext
        websiteLink = agentContext?.client_website || '';
        try {
            feedbackPoints = JSON.parse(agentContext?.feedback_points || '[]'); // Parse feedback_points JSON
        } catch (error) {
            console.error(`❌ Error parsing feedback_points:`, error.message);
            feedbackPoints = agentContext?.feedback_points; // Fallback
        }
        competitors = agentContext?.competitors || '';
        specificResult = agentContext?.specific_result || ''; // Extract specific_result
        painPoints = agentContext?.pain_points || ''; // Extract pain_points
        specificBenefit = agentContext?.specific_benefit || ''; // Extract specific_benefit
    }

    // Construct the response object with dynamic feedback_title
    const response = {
        website: websiteLink, // Website link from context
        feedback_title: `Here are three improvement points for ${websiteLink}`, // Dynamic feedback title
        feedback_points: feedbackPoints, // Parsed array of feedback points
        competitors: competitors, // Competitor string
        result_benefit: { // Combine specific_result and specific_benefit into result_benefit
            result: specificResult,
            benefit: specificBenefit,
        },
        pain_points: painPoints,
    };

    // Return the response as a JSON object
    return {
        statusCode: 200,
        body: JSON.stringify(response),
    };
};

module.exports = { execute };
