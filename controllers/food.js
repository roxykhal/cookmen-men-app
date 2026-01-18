const express = require('express');
const router = express.Router();
// Point to the shared User model in ../models
const User = require('../models/user.js');
const methodOverride = require('method-override');


router.get('/', async (req, res) => {
  try {
    // Look up the currently logged-in user via the session
    const userId = req.session.user._id;
    const user = await User.findById(userId);

    if (!user) return res.redirect('/');

    // Make pantry available to the view
    //assigning pantry to res.locals, means that the pantry array is accessible by res.locals and now views can also access it
    //this is why we can use a loop on pantry in the index file. user.pantry is data from the DB
    res.locals.pantry = user.pantry;

    // Render the pantry index page
    res.render('foods/index');

  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

//Form to render a page that displays a form to add a new item to pantry
router.get('/new', (req, res) => {
    res.render('foods/new');
});

//the create route POST, where the page goes after creating the new item 
router.post('/', async (req, res) => {
  //When you have a POST route, this is for CREATE. Because Pantry is embedded into the user document, we need to push the array onto the user object. 
  //req body holds the form data. So we need to first find the session id of the current logged in user, then push the pantry array into the body. Then save it
  //Once down we redirect back to the foods page. 

  //req.session.user._id can query the DB. session.user shows who is just logged in but not in the Db
  const currentUser = await User.findById(req.session.user._id);
  currentUser.pantry.push(req.body);

  await currentUser.save();
  res.redirect(`/users/${currentUser._id}/foods`)

});


router.get('/:itemId', async (req, res) => {

  //want to find the logged in user so you can see what food they have in the pantry

  const user = await User.findById(req.session.user._id);

  //pantry is the name of the array subdocument, so we assign it to user to get the pantry ID for the user
  //itemId is what is in the params and we assign it to the food variable so in the shows view we can view the name 
  const food = user.pantry.id(req.params.itemId)

  res.render('foods/show', { food })
})


//Delete foods

router.delete('/:itemId', async (req, res) => {
  try {
    
    const user = await User.findById(req.session.user._id);

    if (!user) return res.redirect('/');

    //pantry is embedded in user, so we have to access it like this
    const item = user.pantry.id(req.params.itemId);
    //removes a subdocument
    if (item) {
      item.deleteOne(); // remove the matching subdocument from the array
      //item is not top level, we need to save the user model to ensure the db update is done
      await user.save();
    }

    res.redirect(`/users/${user._id}/foods`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.get('/:itemId/edit', async (req, res) => {

  const user = await User.findById(req.session.user._id);

  if (!user) return res.redirect('/');

  const food = user.pantry.id(req.params.itemId);
  res.render('foods/edit', { food })
}
)

router.put('/:itemId', async (req, res) => {
  //find current logged in user
  const user = await User.findByIdAndUpdate(req.session.user._id);
  
  //find the specific pantry item
  const item = user.pantry.id(req.params.itemId);

  if(!item) return res.redirect('/');

  //update the subdocument using the form data, equivalent to item.name = req.body.name. This is where the update actually happens
  //item.save changes the data in memory
  item.set(req.body);
  //persist those changes to the DB, subdocuments do not live in their own collection so the parent is saved
  await user.save();

  res.redirect(`/users/${user._id}/foods`);

  
})

module.exports = router;

