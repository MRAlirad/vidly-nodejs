const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express.Router();

const Customer = mongoose.model("Customer", new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    isGold: {
        type: Boolean,
        default: false,
    },
}));

router.get('/', async (req, res) => {
    res.send(await Customer.find().sort('name'));
});

router.post('/', async (req, res) => {
    const {error} = validateCustomer(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold,
    });
    res.send(await customer.save());
});

router.get('/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('The customer with the given ID not found');
    res.send(customer);
});

router.put('/:id', async (req, res) => {
    const {error} = validateCustomer(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            phone: req.body.phone,
            isGold: req.body.isGold,
        },
        {
            new: true,
        }
    );

    if (!customer) return res.status(404).send('The customer with the given ID not found');

    res.send(customer);
});

router.delete('/:id', async (req, res) => {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).send('The customer with the given ID not found');
    res.send(customer);
});

const validateCustomer = (customer) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        phone: Joi.string().required(),
        isGold: Joi.bool(),
    });

    return schema.validate(customer);
};

module.exports = router;