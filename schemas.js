const { required } = require('joi');

const Joi = require('joi');

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})