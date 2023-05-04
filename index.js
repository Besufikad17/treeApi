const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

const connectDB = async() => {
    try {
        await prisma.$connect();
        console.log('? Database connected successfully');
    } catch (error) {
        console.log(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

connectDB();

app.use(cors());
app.use(express.json());

app.post("/add", async(req, res) => {
  const { data, parent_id } = req.body;
  try {
    if(parent_id){
      const parent = await prisma.tree.findMany({
        where: {
          id: parseInt(parent_id)
        }
      })

      const newData = await prisma.tree.create({
        data: {
          data: parseInt(data),
          parent: parseInt(parent_id),
          generation: parent[0].generation + 1
        }
      })
      res.json(newData);
    }else{
      const newData = await prisma.tree.create({
        data: {
          data: parseInt(data),
          generation: 1,
        }
      })
      res.json(newData);
    }
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
})

app.get("/tree", async(req, res) => {
  try {
    const datas = await prisma.tree.findMany({
      where: {},
      include: {
        successors: true,
        predecessor: true
      }
    })  
    res.json(datas);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
})

app.listen(4000);

