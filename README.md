# AI 模型测试评估平台 (AI Model Evaluation Platform)

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?logo=react)](https://reactjs.org/) [![FastAPI](https://img.shields.io/badge/FastAPI-0.100.0-green.svg?logo=fastapi)](https://fastapi.tiangolo.com/) [![Docker](https://img.shields.io/badge/Docker-20.10-blue.svg?logo=docker)](https://www.docker.com/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg?logo=postgresql)](https://www.postgresql.org/)

一个专业的、可扩展的AI模型测试与评估平台，旨在为AI研究员、开发者和产品经理提供一站式模型评估解决方案。

---

## 核心功能

*   **📊 统一模型管理**: 支持多种主流AI模型服务商（如 OpenAI, Anthropic, Google Gemini）及本地化部署方案（如 Ollama）的统一接入和管理。
*   **⚙️ 自动化测试流程**: 提供从模型选择、基准测试配置到任务执行的全自动化流程，支持并发测试，显著提升评估效率。
*   **🔬 专业基准测试**: 深度集成行业特定基准（如 ElecBench, EngiBench），并支持用户上传和管理自定义测试集。
*   **🚀 异步任务队列**: 基于 Celery 和 Redis 构建强大的异步任务处理系统，实时监控测试任务状态（排队、执行中、完成、失败）。
*   **📈 可视化分析报告**: 提供多维度、可视化的测试结果对比分析，包括雷达图、柱状图等，并支持报告导出（CSV, JSON, PDF）。
*   **🔐 用户与权限**: 具备完善的用户认证和基于角色的访问控制（RBAC）。

## 系统架构

本平台采用前后端分离的现代Web应用架构。前端负责用户交互和数据可视化，后端提供稳定的API服务、模型调度和异步任务处理能力。

```mermaid
graph TB
    subgraph "用户端"
        A[React + Ant Design]
        B[ECharts 数据可视化]
    end
    
    subgraph "网关与服务"
        D[Nginx 反向代理]
        F[FastAPI 应用服务]
    end
    
    subgraph "异步任务系统"
        I[Celery Worker]
        J[Redis 消息队列]
    end
    
    subgraph "数据与存储"
        L[PostgreSQL 数据库]
        M[文件/模型存储]
    end
    
    subgraph "外部模型服务"
        O[OpenAI / Claude API]
        P[本地模型 (Ollama)]
    end
    
    A --> D
    B --> D
    D --> F
    F --> J
    F --> L
    F --> M
    I -- 从...消费 --> J
    I -- 执行测试 --> O
    I -- 执行测试 --> P
    I -- 存储结果 --> L
```

## 技术栈

| 类别 | 技术 | 描述 |
| :--- | :--- | :--- |
| **前端** | React, Vite, Ant Design, Tailwind CSS, ECharts | 构建响应式、美观专业的用户界面和数据可视化图表。 |
| **后端** | FastAPI, Python | 提供高性能、异步的RESTful API服务。 |
| **任务队列**| Celery, Redis | 负责处理耗时的模型评测任务，实现异步化和高并发。 |
| **数据库** | PostgreSQL, Redis | 使用PostgreSQL进行持久化数据存储，Redis作为缓存和消息代理。 |
| **部署** | Docker, Docker Compose, Nginx | 通过容器化实现开发、测试和生产环境的一致性与隔离。 |

## 快速开始

请确保您的本地环境已安装以下软件：

*   [Docker](https://www.docker.com/products/docker-desktop/)
*   [Node.js](https://nodejs.org/en) (v18 或更高版本)
*   [npm](https://www.npmjs.com/) 或 [yarn](https://yarnpkg.com/)

### 1. 启动后端服务

后端所有服务（API, 数据库, 任务队列等）已通过 Docker Compose 进行编排。

```bash
# 1. 进入后端项目目录
cd fastapi_template

# 2. 启动 Docker 容器 (首次启动会自动构建镜像)
docker-compose up --build -d

# 3. 查看服务日志 (可选)
docker-compose logs -f
```

服务启动后，可以通过以下地址访问：
*   **API 文档 (Swagger)**: `http://localhost/docs`
*   **Celery 监控 (Flower)**: `http://localhost:5555`

### 2. 启动前端项目

前端项目是一个独立的 Vite 应用，需要单独安装依赖并启动开发服务器。

```bash
# 1. (在项目根目录) 进入前端项目目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

启动成功后，您可以在浏览器中打开 `http://localhost:5173` (或其他Vite指定的端口) 访问平台界面。

## 项目结构

```
.
├── fastapi_template/ # 后端 (FastAPI)
│   ├── app/            # 核心应用代码
│   ├── docker-compose.yml # Docker 服务编排
│   └── Dockerfile      # 后端镜像构建文件
├── frontend/           # 前端 (React + Vite)
│   ├── src/            # 核心源代码
│   └── package.json    # 前端依赖管理
└── README.md           # 你正在阅读的文件
```

## 贡献指南

我们欢迎任何形式的贡献！如果您有好的想法或建议，请随时提交 Pull Request 或创建 Issue。

1.  Fork 本仓库
2.  创建您的 Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4.  Push 到您的 Branch (`git push origin feature/AmazingFeature`)
5.  提交一个 Pull Request

## 许可证

本项目采用 MIT 许可证。详情请见 `LICENSE` 文件。