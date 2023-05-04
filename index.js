const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { warnEnvConflicts } = require("@prisma/client/runtime");

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

const getGeneration = async(id) => {
  let generation = 1; 
  while(true){
    const user = await prisma.tree.findMany({
      where: {
        id
      }
    })
    if(user[0].parent){
      id = user[0].parent;
      generation++;
    }else{
      break;
    }
  }
  return generation;
}

app.post("/add", async(req, res) => {
  const { data, parent_id } = req.body;
  try {
    const newData = await prisma.tree.create({
      data: {
        data: parseInt(data),
        parent: parseInt(parent_id) || undefined
      }
    })
    res.json(newData);
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

