import fastify from "fastify"
import { z } from "zod"
import { database } from "./lib/database"

const app = fastify()

app.get("/", (request, reply) => {
  return reply.status(200).send({
    message: "API Funcionando!",
  })
})

app.post("/usuario", async (request, reply) => {
  const schemaBody = z.object({
    nome: z.string().min(4),
    sobrenome: z.string().min(4),
    email: z.string().email(),
    senha: z.string().min(6),
  })

  const { email, nome, senha, sobrenome } = schemaBody.parse(request.body)

  const usuario = await database.user.create({
    data: {
      email,
      nome,
      senha,
      sobrenome,
    },
  })

  return reply
    .status(201)
    .send({ message: "Usuário cadastrado com sucesso!", usuario: usuario })
})

app.post("/login", async (request, reply) => {
  const schemaBody = z.object({
    email: z.string().email(),
    senha: z.string().min(6),
  })

  const { email, senha } = schemaBody.parse(request.body)

  const usuario = await database.user.findUnique({
    where: {
      email,
    },
  })

  if (!usuario) {
    return reply.status(404).send({ message: "Usuário não encontrado!" })
  }

  if (senha !== usuario.senha) {
    return reply.status(401).send({ message: "Senha inválida!" })
  }

  return reply
    .status(200)
    .send({ message: "Login efetuado com sucesso!", usuario })
})

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running!")
})
