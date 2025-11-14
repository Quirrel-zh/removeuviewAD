# removeuviewAD

一个用于屏蔽 uView Plus 文档网站广告弹窗的油猴/脚本猫脚本。

## 📖 简介

本项目提供了一个 Tampermonkey/ScriptCat 用户脚本，用于屏蔽 `uview-plus.jiangruyi.com` 网站上的广告弹窗，并绕过其检测机制，提供更好的浏览体验。

## 📦 安装方法

### 前置要求

- 安装用户脚本管理器：
  - [Tampermonkey](https://www.tampermonkey.net/)
  - [ScriptCat](https://docs.scriptcat.org/)
  

### 快速安装（推荐）

1. 点击 [脚本猫](https://scriptcat.org/scripts/code/4627/%E5%B1%8F%E8%94%BD%E5%B9%BF%E5%91%8A%E5%BC%B9%E7%AA%97.user.js)/[Tampermonkey](https://update.greasyfork.org/scripts/555779/%E5%B1%8F%E8%94%BD%E5%B9%BF%E5%91%8A%E5%BC%B9%E7%AA%97.user.js) 下载脚本文件

## 🚀 使用方法

安装完成后，脚本会在访问 `https://uview-plus.jiangruyi.com/*` 时自动运行，无需任何手动操作。

## 📝 兼容性

- ✅ Chrome / Edge (Chromium)
- ✅ Firefox
- ✅ Safari (需要 Tampermonkey)
- ✅ Opera

## ⚙️ 配置说明

脚本默认配置：

- **运行时机**: `document-start` - 在页面加载前就开始执行
- **匹配规则**: `https://uview-plus.jiangruyi.com/*`
- **权限**: `none` - 不需要特殊权限

如需修改配置，请编辑脚本头部的元数据部分。

## 🔧 开发

### 项目结构

```
removeuviewAD/
├── LICENSE          # MIT 许可证
├── README.md        # 项目说明文档
└── scripts/
    └── script.js    # 用户脚本主文件
```

### 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## ⚠️ 免责声明

本脚本仅供学习和研究使用。使用本脚本可能违反目标网站的服务条款，使用者需自行承担风险。作者不对使用本脚本造成的任何后果负责。

## 🙏 致谢

感谢所有为开源社区做出贡献的开发者！

## 📮 反馈

如有问题或建议，请通过以下方式反馈：

- [GitHub Issues](https://github.com/Quirrel-zh/removeuviewAD/issues)
- [GitHub Discussions](https://github.com/Quirrel-zh/removeuviewAD/discussions)

---

**⭐ 如果这个项目对你有帮助，请给个 Star！或一杯咖啡！**
![alt text](images/alipay.jpg)
![alt text](images/wechat.jpg)