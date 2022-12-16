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
router.get("/account/isactive/:link", userController.isCorrectActivateLink);

router.put("/user", authMiddleware, userController.change);
router.post("/registration", userController.registration);
router.post("/account/active", userController.activateAccount);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/role", roleController.createRole);
router.post("/avatar", userController.updatePicture);

router.get("/folder", [authMiddleware], folderController.get);
router.post("/folder", folderController.add);
router.put("/folder/:id", folderController.change);
router.delete("/folder/:id", folderController.delete);

router.get("/file", [authMiddleware], fileController.get);
router.post("/upload", fileController.add);
router.put("/file/:id", fileController.change);
router.delete("/file/:id", fileController.delete);
module.exports = router;
