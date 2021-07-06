const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id
    const sauce = new Sauce({ 
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    })
    sauce.save()
    .then(() => res.status(201).json({message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }))
}

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }))
}

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch( error => res.status(400).json({ error }))
}

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? 
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id})
    .then(() => res.status(200).json({message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }))
}

exports.deleteOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images')[1]
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet Supprimé !' }))
            .catch(error => res.status(400).json({ error }))
        })
    })
    .catch(error => res.status(500).json({ error }))
}

exports.rateSauce = (req, res, next) => {
    switch (req.body.like) {

        // SI L'UTILISATEUR LIKE
        case 1: Sauce.findByIdAndUpdate(req.params.id, { $inc: {likes: 1 }, $push: {usersLiked: req.body.userId}, _id: req.params.id })
            .then(() => res.status(201).json({ message: "Liké !" }))
            .catch(error => res.status(400).json({ error }));
            break;
    
        // SI L'UTILISATEUR REVIENT SUR SA DECISION
        case 0: Sauce.findOne({ _id: req.params.id })
        .then(sauce => {

            // POUR RETIRER LE LIKE
            if (sauce.usersLiked.includes(req.body.userId)) {
            Sauce.findByIdAndUpdate(req.params.id, { $inc: {likes: -1 }, $pull: {usersLiked: req.body.userId}, _id: req.params.id })
            .then(() => res.status(201).json({ message: "Vous avez retiré votre like !" }))
            .catch(error => res.status(400).json({ error }));
            }

            // POUR RETIRER LE DISLIKE
            if (sauce.usersDisliked.includes(req.body.userId)) {
                Sauce.findByIdAndUpdate(req.params.id, { $inc: {dislikes: -1 }, $pull: {usersDisliked: req.body.userId}, _id: req.params.id })
                .then(() => res.status(201).json({ message: "Vous avez retiré votre dislike !" }))
                .catch(error => res.status(400).json({ error }));
            }
        })
        .catch(() => res.status(500).json({ message: "La sauce n'a pas été trouvée !"}))
        break; 
    
        // SI L'UTILISATEUR DISLIKE
        case -1: 
            Sauce.findByIdAndUpdate(req.params.id, { $inc: {dislikes: 1 }, $push: {usersDisliked: req.body.userId}, _id: req.params.id })
            .then(() => res.status(201).json({ message: "Disliké !" }))
            .catch(error => res.status(400).json({ error }));
            break;
        }
    }

    
  
    //console.log(req.body.like);
    // Sauce.findOne({ _id: req.params.id });
  
  
    // switch (req.body.like) {
    //     case -1: 
    //         Sauce.updateOne({ $inc: {dislikes: 1 }, $push: {usersDisliked: req.body.userId}, _id: req.params.id })
    //        .then(() => res.status(201).json({ message: "Disliké !" }))
    //        .catch(error => res.status(400).json({ error }));
    //       break;
  
    //     case 0: if (usersLiked.includes(req.body.userId)) {
    //       Sauce.updateOne({ $inc: {likes: -1 }, $pull: {usersLiked: req.body.userId}, _id: req.params.id })
    //       .then(() => res.status(201).json({ message: "Pas d'avis..." }))
    //       .catch(error => res.status(400).json({ error }));
    //     } else if(usersDisliked.includes(req.body.userId)) {
    //       Sauce.updateOne({ $inc: {dislikes: -1 }, $pull: {usersDisliked: req.body.userId}, _id: req.params.id })
    //       .then(() => res.status(201).json({ message: "Pas d'avis" }))
    //       .catch(error => res.status(400).json({ error }));
    //     }
    //       break;
  
    //     case 1: Sauce.updateOne({ $inc: {likes: 1 }, $push: {usersLiked: req.body.userId}, _id: req.params.id })
    //       .then(() => res.status(201).json({ message: "Liké !" }))
    //       .catch(error => res.status(400).json({ error }));
    //       break;
    //   