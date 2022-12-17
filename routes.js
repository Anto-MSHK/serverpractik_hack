const userController = require("./controllers/user-controller");
const roleController = require("./controllers/role-controller");
const authMiddleware = require("./middlewares/auth-middleware");
const roleMiddleware = require("./middlewares/role-middleware");
const fileController = require("./controllers/file-controller");
const folderController = require("./controllers/folder-controller");

const router = require("express").Router();

router.get("/refresh", userController.refresh);

router.get(
  "/users",
  [authMiddleware, roleMiddleware("ADMIN")],
  userController.getUsers
);
router.get("/user/:id", [authMiddleware], userController.getUser);

router.get("/account/isactive/:link", userController.isCorrectActivateLink);

router.put("/user", authMiddleware, userController.change);
router.post(
  "/registration",
  [authMiddleware, roleMiddleware("ADMIN")],
  userController.registration
);
router.post("/account/active", userController.activateAccount);
router.post("/login", userController.login);
router.post("/logout", authMiddleware, userController.logout);
router.post("/role", roleController.createRole);
router.post("/avatar", authMiddleware, userController.updatePicture);

router.get("/folder", [authMiddleware], folderController.get);
router.post(
  "/folder",
  [authMiddleware, roleMiddleware("ADMIN")],
  folderController.add
);
router.put(
  "/folder/:id",
  [authMiddleware, roleMiddleware("ADMIN")],
  folderController.change
);
router.delete(
  "/folder/:id",
  [authMiddleware, roleMiddleware("ADMIN")],
  folderController.delete
);

router.get("/file", [authMiddleware], fileController.get);
router.post(
  "/upload",
  [authMiddleware, roleMiddleware("ADMIN")],
  fileController.add
);
router.put(
  "/file/:id",
  [authMiddleware, roleMiddleware("ADMIN")],
  fileController.change
);
router.delete(
  "/file/:id",
  [authMiddleware, roleMiddleware("ADMIN")],
  fileController.delete
);
module.exports = router;
