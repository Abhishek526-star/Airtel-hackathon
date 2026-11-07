const supportAssistantService = require('../services/ai/supportAssistantService');

// @desc    Chat with Personal AI Customer Support Assistant
// @route   POST /api/support/chat
// @access  Public or Protected
exports.chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const userId = req.user ? req.user._id : null;

    const result = await supportAssistantService.processChatMessage({
      userId,
      message,
      history,
    });

    res.status(200).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Explicitly Escalate to Field Engineer / Support Partner
// @route   POST /api/support/escalate
// @access  Public or Protected
exports.escalate = async (req, res, next) => {
  try {
    const { reason = 'Customer requested on-site technician dispatch from AI Assistant' } = req.body;
    const userId = req.user ? req.user._id : null;
    const userDetails = req.user
      ? {
          fullName: req.user.fullName,
          phone: req.user.phone,
          email: req.user.email,
        }
      : null;

    const ticketInfo = await supportAssistantService.createEscalationTicket(userId, userDetails, reason);

    res.status(200).json({
      success: true,
      message: `Support ticket ${ticketInfo.ticketId} created. Priority field technician assigned.`,
      data: ticketInfo,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
