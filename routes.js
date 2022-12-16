router.put("/user", authMiddleware, userController.change);
router.post("/registration", userController.registration);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/role", roleController.createRole);
router.post("/avatar", userController.updatePicture);
