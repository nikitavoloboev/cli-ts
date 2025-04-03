import { cac } from "cac"
import os from "os"
import fs from "fs/promises"
import path from "path"
import crypto from "crypto"

const cli = cac("cli-ts")

function generatePassword(length: number = 12): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
  const randomBytes = crypto.randomBytes(length)
  let password = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i]! % chars.length
    password += chars[randomIndex]
  }

  return password
}

cli
  .command(
    "new [template] [project-name]",
    "Create a new project from a template"
  )
  .option("--silent", "Do not print any logs")
  .option("--generate-pass", "Generate a random secure password")
  .action(async (template, projectName, flags) => {
    if (flags.generatePass) {
      console.log(generatePassword())
      process.exit(0)
    }

    // Check if both arguments are provided
    if (!template || !projectName) {
      console.error("Error: Both template and project-name are required.")
      cli.outputHelp()
      process.exit(1)
    }

    const silent = flags.silent
    const sourcePath = path.join(os.homedir(), "new", template)
    const destPath = path.join(process.cwd(), projectName)

    // Check if the template exists
    try {
      await fs.access(sourcePath)
    } catch {
      console.error(`Error: Template "${template}" not found at ${sourcePath}`)
      process.exit(1)
    }

    // Check if the destination already exists
    try {
      await fs.access(destPath)
      console.error(
        `Error: Destination "${projectName}" already exists at ${destPath}`
      )
      process.exit(1)
    } catch {
      // Destination does not exist, proceed with copying
    }

    // Copy the template to the destination
    try {
      await fs.cp(sourcePath, destPath, { recursive: true })
      if (!silent) {
        console.log(
          `Created new project "${projectName}" from template "${template}"`
        )
      }
    } catch (err: any) {
      console.error(`Error: Failed to create project: ${err.message}`)
      process.exit(1)
    }
  })

cli.help()
cli.parse()
