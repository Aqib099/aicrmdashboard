import { Contact } from "../models/Contact.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

export const getContacts = asyncHandler(async (req, res) => {
    const { search, tag } = req.query;
    const filter = { owner: req.user._id };

    if(tag) filter.tags = tag
    if (search) {
        const rx = new RegExp(search, "i");
        filter.$or = [{ name: rx}, {email: rx}, {company: rx}];
    }

    const contacts = await Contact.find(filter).sort({favorite: -1, name: 1});
    res.json({success: true, count: contacts.length, contacts})

});

export const getContact = asyncHandler(async (req, res) => {
    const contact = await findOne({_id: req.params._id, owner: req.user._id});
    if(!contact) throw new ApiError(404, "Contact not found");
    res.json({success: true, contact});
})

export const createContact = asyncHandler(async (req, res) => {
    const contact = await Contact.create({...req.body, owner: req.user._id});
    res.status(201).json({success: true, contact})
})

export const updateContact = asyncHandler(async (req, res) => {
    const { owner, ...updates } = req.body;
    const conatct = await findOneAndUpdate(
        {_id: req.params.id, owner: req.user._id},
        updates,
        {new: true, runValidators: true}
    );
    if (!contact) throw new ApiError(404, "Contact not found");
    res.json({success: true, contact})
});

export const deleteContact = asyncHandler(async (req, res) => {
    const contact = await findOneAndDelete(
        {
            _id: req.params.id,
            owner: req.user._id
        }
    );
    if(!contact) throw new ApiError(404, "Contact not found");
    res.json({success: true, message: "Contact Deleted"})
})