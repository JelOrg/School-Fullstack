// ! doesn't actually works, but this what the files in the controller file should look like and be able to take out specific data, username from users
// userController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUser = async (req, res) => {
  try {
    // 1. The Controller asks Prisma for data
    const user = await prisma.user.findUnique({
      where: { userId: parseInt(req.params.id) },
      include: { department: true }, // This uses your relation!
    });

    // 2. The Controller decides what to do with that data
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. The Controller sends the data back to the user
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = getUser;
