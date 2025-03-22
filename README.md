<!-- markdownlint-disable MD033 -->
<!-- markdownlint-disable MD010 -->
<!-- markdownlint-disable MD007 -->
<div align="left" style="position: relative;">
<img src="https://cdn-icons-png.flaticon.com/512/6295/6295417.png" align="right" width="30%" style="margin: -20px 0 0 20px;">
<h1>CareSanar</h1>
<p align="left">
	<em>Manage fast and securely</em>
</p>
<p align="left">
	<img src="https://img.shields.io/github/license/jericho1050/hms?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/jericho1050/hms?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/jericho1050/hms?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/jericho1050/hms?style=default&color=0080ff" alt="repo-language-count">
</p>
<p align="left"><!-- default option, no dependency badges. -->

<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="supabase">
<img src="https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white" alt="nextjs">
</p>
<p align="left">
	<!-- default option, no dependency badges. -->
</p>
</div>
<br clear="right">

## 🔗 Table of Contents

- [🔗 Table of Contents](#-table-of-contents)
- [📍 Overview](#-overview)
- [📽 Demo Video](#-demo-video)
- [👾 Features](#-features)
- [🚀 Getting Started](#-getting-started)
  - [Test Account in production (Demo)](#test-account-in-production-demo)
  - [☑️ Prerequisites](#️-prerequisites)
  - [⚙️ Installation](#️-installation)
  - [🤖 Usage](#-usage)
  - [Supabase Config](#supabase-config)
  - [🧪 Testing](#-testing)
- [🔰 Contributing](#-contributing)
- [🎗 License](#-license)
- [🙌 Acknowledgments](#-acknowledgments)
- [Discord](#discord)

---

## 📍 Overview

CareSanar is an innovative Hospital Management System designed to streamline and automate administrative, financial, and clinical processes within a hospital. By integrating AI capabilities, HMS enhances decision-making, optimizes workflows, and provides insightful analytics to improve hospital operations. From patient management to staff scheduling, billing, and medical record-keeping, HMS is a comprehensive solution for modern healthcare facilities.

---

## 📽 Demo Video

- 📊 [Dashboard/Patient Demo](https://github.com/user-attachments/assets/d20a29bf-97d1-4748-a9fd-ad45c342a275)
- 👤 [Patient Edit Demo](https://github.com/user-attachments/assets/59ab8e20-e0d7-48ad-b0be-5780804d1433)
- 🤖 [AI Assistant Demo](https://github.com/user-attachments/assets/c13465a7-383f-4611-9cb2-f31b9fefb9c0)
- 📅 [Appointment and Staff Demo](https://github.com/user-attachments/assets/755fbf2c-7009-4c88-aad3-bf2caefc8631)
- 🏥 [Rooms and Reports & Analytics Demo](https://github.com/user-attachments/assets/e74f5927-043e-4dda-a73b-ca6bc8a8e12f)
- 📦 [Inventory Demo](https://github.com/user-attachments/assets/6e810481-6ea5-4dc5-a7fe-ec18d0828f1c)
- 🧾💰 [Billing and Invoice Demo](https://github.com/user-attachments/assets/aebd8bfc-4892-46f3-a81b-a82ac23decaf)

<!--
**Run from your browser:**

[demo1][Dashboard/Patient Demo]
[demo2][Patient Edit Demo]
[demo3][AI Assistant Demo]
[demo4][Appointment and Staff Demo]
[demo5][Rooms and Reports & Analytics Demo]
[demo6][Iventory Demo]
-->

---

## 👾 Features

- **Data Analytics**: Data visualization for various pages, Visualize key metrics and operational data in real-time
- **Patient Management**: Efficiently manage patient records, admissions, and discharges.
- **Appointment Management**:Efficiently manage and track appointments, with insights.
- **Staff Management**: Staff management to ensure optimal resource allocation. Schedules staff based on their availability.
- **Bed Management**: Bed management to ensure optimal ocuppancy allocation.
- **Reports Scheduler**: Simplify sending of reports with automated email reports.
- **Medical Records**: Maintain secure and accessible electronic medical records.
- **Iventory Management**: Keep track of inventory and give insigths to each item. Ensuring an item doesn't go low in stock.
- **AI-Powered Diagnosis Assistant**: Leverage AI to support medical healthcare, identify symptoms, and support decision-making..
- **Billing and Invoices**: Track, send, and print invoices in the dashboard; Process and manage bills/invoice efficiently.
  
---

<details id="tech-details">
 <!-- ## 📐✏️👷‍♀️ Overview Techical Details -->
 <summary > 📐✏️👷‍♀️ Overview Techical Details</summary>


![ERD](https://github.com/user-attachments/assets/20a6a643-d808-4bae-9b33-93a7e0d39075)
![ARCHITECTURE](https://github.com/user-attachments/assets/8906e857-196d-4ab8-9d5b-4980378123fb)

Ah yes, ofc monolithic, for the serverless model we are using from `https://www.together.ai` inference.
</details>

---

## 🚀 Getting Started

### Test Account in production (Demo)

This account will be **deleted** once the judging period of the hackathon is finished.

- **email**: tester@caresanar.online
- **passsword**: 123

### ☑️ Prerequisites

Before getting started with hms, ensure your runtime environment meets the following requirements:

- **Programming Language:** TypeScript
- **Package Manager:** Pnpm


### ⚙️ Installation

Install hms using one of the following methods:

**Build from source:**

1. Clone the hms repository:
```sh
❯ git clone https://github.com/jericho1050/hms
```

2. Navigate to the project directory:
```sh
❯ cd hms
```

3. Install the project dependencies:


**Using `pnpm`** &nbsp; ![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220)

```sh
❯ pnpm install
```


### 🤖 Usage
Run hms using the following command:
**Using `pnpm`** &nbsp; ![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220)

```sh
❯ pnpm dev
```

or

```sh
❯ pnpm start
```

**Important**: Read below for supabase configurations, also don't forgot paste the necessary environment variables in `.env`

### Supabase Config

1. Create a new supabase project

![Image](https://github.com/user-attachments/assets/d2fc71c3-7655-4680-9258-19114c6f86ff)

2. Go to the `SQL EDITOR`, then copy and paste the code from `db-schema.sql`

![Image](https://github.com/user-attachments/assets/7262a84d-12d4-4129-bb22-8f363378dc71)

3. Then go fetch your Porject URL and API Key and paste it in `.env` or `.env.local` to connect

4. Go to project settings, get your project ID, then in your terminal, copy and paste the code below to generate types

```sh
npx supabase gen types typescript --project-id your_project_id  --schema public > types/supabase.ts
```

### 🧪 Testing
Run the test suite using the following command:
**Using `pnpm`** &nbsp; ![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220)

```sh
❯ pnpm test
```

---

## 🔰 Contributing

- **💬 [Join the Discussions](https://github.com/jericho1050/hms/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/jericho1050/hms/issues)**: Submit bugs found or log feature requests for the `hms` project.
- **💡 [Submit Pull Requests](https://github.com/jericho1050/hms/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.

   ```sh
   git clone https://github.com/jericho1050/caresanar
   ```

3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.

   ```sh
   git checkout -b new-feature-x
   ```

4. **Make Your Changes**: Develop and test your changes locally.

5. **Commit Your Changes**: Commit with a clear message describing your updates.

   ```sh
   git commit -m 'Implemented new feature x.'
   ```

6. **Push to github**: Push the changes to your forked repository.

   ```sh
   git push origin new-feature-x
   ```

7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.

8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!

</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/jericho1050/hms/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=jericho1050/hms">
   </a>
</p>
</details>

---

## 🎗 License

This project is protected under the [Apache License](https://choosealicense.com/licenses/apache-2.0/) License. For more details, refer to the [LICENSE](LICENSE) file.

---

## 🙌 Acknowledgments

<!-- - List any resources, contributors, inspiration, etc. here. -->

## Discord

![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white) jericho1050

---

<!-- caresanar DEMOS -->
[Demo-1]: https://github.com/user-attachments/assets/d20a29bf-97d1-4748-a9fd-ad45c342a275
[Demo-2]: https://github.com/user-attachments/assets/59ab8e20-e0d7-48ad-b0be-5780804d1433
[Demo-3]: https://github.com/user-attachments/assets/c13465a7-383f-4611-9cb2-f31b9fefb9c0
[Demo-4]: https://github.com/user-attachments/assets/755fbf2c-7009-4c88-aad3-bf2caefc8631
[Demo-5]: https://github.com/user-attachments/assets/e74f5927-043e-4dda-a73b-ca6bc8a8e12f
[Demo-6]: https://github.com/user-attachments/assets/6e810481-6ea5-4dc5-a7fe-ec18d0828f1c
