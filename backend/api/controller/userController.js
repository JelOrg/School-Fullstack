//Doesn actually do anything for now, just reference
import * as userService from "#services/fetchUserInfo.js";

const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
