const userController = require("./controllers/user-controller");
const roleController = require("./controllers/role-controller");
const authMiddleware = require("./middlewares/auth-middleware");
const roleMiddleware = require("./middlewares/role-middleware");

const router = require("express").Router();

router.get("/refresh", userController.refresh);

router.get(
  "/users",
  [authMiddleware, roleMiddleware("ADMIN")],
  userController.getUsers
);
router.get("/account/isactive/:link", userController.isCorrectActivateLink);

router.put("/user", authMiddleware, userController.change);
router.post("/registration", userController.registration);
router.post("/account/active", userController.activateAccount);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/role", roleController.createRole);
router.post("/avatar", userController.updatePicture);

module.exports = router;
