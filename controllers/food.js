const express = require('express');
const router = express.Router();
// Point to the shared User model in ../models
const User = require('../models/user.js');

router.get('/', async (req, res) => {
  try {
    // Look up the currently logged-in user via the session
    const userId = req.session.user._id;
    const user = await User.findById(userId);

    if (!user) return res.redirect('/');

    // Make pantry available to the view
    //assigning pantry to res.locals, means that the pantry array is accessible by res.locals and now views can also access it
    res.locals.pantry = user.pantry;

    // Render the pantry index page
    res.render('foods/index');

  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});


router.get('/new', (req, res) => {
    res.render('foods/new');
});

//the create route
router.post('/', async (req, res) => {
    try {

    //get the logged in users ID from the session, to look up that user in mongoDB
    const userId = req.session.user._id;
    //queries mongodb for the user document whose _id matches userId. We need the real
    //database document to be able to modify the array so thats why we query mongoDB
    const user = await User.findById(userId)

    if(!user) {
        return res.redirect('/');
    }

    //push new food object(req.body) to pantry array
    user.pantry.push(req.body);
    await user.save();

    //for confirmation, redirect to pantry index
res.redirect(`/users/${userId}/foods`);
} catch (error) {
    console.log(error);
    res.redirect('/')
}
});

//Delete foods

router.delete('/:itemId', async (req, res) => {
  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    if (!user) return res.redirect('/');

    const item = user.pantry.id(req.params.itemId);
    if (item) {
      item.deleteOne(); // remove the matching subdocument from the array
      await user.save();
    }

    res.redirect(`/users/${userId}/foods`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

//When you click on the hyperlink of one of the food items. I want to be able to delete it

router.get('/:itemId', async (req, res) => {
  const user = await User.findById(req.params.itemId);

  res.render('foods/show')
})

module.exports = router;
