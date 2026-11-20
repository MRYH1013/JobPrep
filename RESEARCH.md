# JobPrep 0.2 题库调研记录

检索日期：2026-11-19。近期面经的目标窗口：2025-11-19 至 2026-11-19。基础教材和官方技术文档按主题选取，未把其检索时间当成发布时间。

## 当前交付范围

- 4 个上层职业大类：互联网与技术、游戏与创意、商业与服务、人文与行为。
- 6 个学习方向：前端开发、Java 后端、游戏行业、商品销售、设计创意、心理学相关。
- 36 个细分岗位，每个 7 道原创问题；每个方向 42 道，共 252 道。
- 每题包含参考回答、回答框架、易错点、追问、练习任务和主题参考。
- 54 个去重的主题参考链接。包括官方技术文档、工具/平台方实践资料、专业机构资料和开放教材。

## 检索方法与边界

按岗位与主题检索，而不是批量复制一个题库。技术类优先 MDN、React、Vue、TypeScript、Oracle、Spring、MySQL、Redis、AWS 与引擎官方资料；设计优先 W3C、NN/g 和 Adobe；销售参考平台方的招聘问题、销售流程与零售经营资料；心理学参考 APA、OpenStax 与 Cochrane。

搜索主题包括：前端语言与框架、缓存与数据库、并发与事务、Unity 生命周期和性能、Unreal 框架和联网、游戏关卡和玩家引导、Steam 发行、零售招聘、销售资格判断与管道、客户留存、设计作品集与可用性、设计系统与动效、心理研究设计、测量与职业伦理。

资料链接是拓展入口，不是逐题真题证明。场景问题与答案由编辑原创编写，有些通用职业判断并非来源原文的直接结论。保留这一属性，避免让引用产生不准确的权威感。技术资料可能重定向至更新的在线版本；涉及 Unity 6000.0、Java 21、MySQL 8.4 等版本时，应结合具体项目复核。

APA 的职业伦理资料不是中国执业资格或法律依据。心理学题目以求职表达、研究和测评方法为范围，不提供个体诊断与治疗方案。当前尚未完成各行业专家逐题独立审阅。

不将搜索结果数量、网站自称的真题数，或本项目题目数量当成“大厂高频”的样本量。原有面经线索保留在文末，不混入独立企业频率统计。

初次访问的 Adobe 旧品牌文章地址与 HubSpot 资格判断地址返回 404，未收入最终目录；Adobe 已改为当前可访问的品牌文章。部分动态站点仅能读取有限正文（例如某些 AWS / Redis 文档页），保留为主题拓展链接，不声称已完成逐条内容验证。

## 去重资料目录

| 来源 | 参考链接 |
|---|---|
| MDN · JavaScript Guide | [打开资料](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) |
| React · Learn | [打开资料](https://react.dev/learn) |
| React · Render and Commit | [打开资料](https://react.dev/learn/render-and-commit) |
| Vue · Reactivity in Depth | [打开资料](https://vuejs.org/guide/extras/reactivity-in-depth.html) |
| Vue · Watchers | [打开资料](https://vuejs.org/guide/essentials/watchers.html) |
| TypeScript · Narrowing | [打开资料](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) |
| TypeScript · Generics | [打开资料](https://www.typescriptlang.org/docs/handbook/2/generics.html) |
| MDN · HTTP | [打开资料](https://developer.mozilla.org/en-US/docs/Web/HTTP) |
| W3C · WCAG 2.2 | [打开资料](https://www.w3.org/WAI/WCAG22/quickref/) |
| web.dev · Performance | [打开资料](https://web.dev/learn/performance) |
| web.dev · Virtualize large lists | [打开资料](https://web.dev/articles/virtualize-long-lists-react-window) |
| Oracle · Java 21 API | [打开资料](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html) |
| Oracle · ThreadPoolExecutor | [打开资料](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html) |
| Oracle · Virtual Threads / JDK 21 | [打开资料](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html) |
| Spring · Transactional | [打开资料](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html) |
| Spring · Dependency Injection | [打开资料](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html) |
| MySQL 8.4 · Indexes | [打开资料](https://dev.mysql.com/doc/refman/8.4/en/optimization-indexes.html) |
| MySQL 8.4 · Transaction Isolation | [打开资料](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html) |
| MySQL 8.4 · Deadlocks | [打开资料](https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlocks-handling.html) |
| Redis · Persistence | [打开资料](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) |
| Redis · Key eviction | [打开资料](https://redis.io/docs/latest/reference/eviction/) |
| Redis · Distributed locks | [打开资料](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/) |
| AWS Builders Library · Idempotent APIs | [打开资料](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) |
| AWS Builders Library · Timeouts and retries | [打开资料](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) |
| Unity · Execution Order | [打开资料](https://docs.unity3d.com/6000.0/Documentation/Manual/ExecutionOrder.html) |
| Unity · Profiler | [打开资料](https://docs.unity3d.com/6000.0/Documentation/Manual/Profiler.html) |
| Epic · Gameplay Framework | [打开资料](https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-framework-in-unreal-engine) |
| Epic · Networking Overview | [打开资料](https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-overview-for-unreal-engine) |
| Epic · Onboarding Players | [打开资料](https://dev.epicgames.com/documentation/fortnite/onboarding-players-in-fortnite-creative?lang=en-US) |
| Epic · Level Designer Quick Start | [打开资料](https://dev.epicgames.com/documentation/en-us/unreal-engine/level-designer-quick-start-in-unreal-engine) |
| Epic · Physically Based Materials | [打开资料](https://dev.epicgames.com/documentation/en-us/unreal-engine/physically-based-materials-in-unreal-engine) |
| Steamworks · Wishlists | [打开资料](https://partner.steamgames.com/doc/marketing/wishlist) |
| Steamworks · Marketing | [打开资料](https://partner.steamgames.com/doc/marketing) |
| LinkedIn · Retail Sales Interview Questions | [打开资料](https://business.linkedin.com/hire/resources/how-to-hire-guides/retail-sales-associate-interview-questions) |
| Salesforce · Sales Pipeline | [打开资料](https://www.salesforce.com/sales/pipeline/) |
| Shopify · Retail Metrics | [打开资料](https://www.shopify.com/blog/retail-metrics) |
| Salesforce · Sales Types and Strategies | [打开资料](https://www.salesforce.com/sales/what-is-sales/) |
| Shopify · Customer Retention | [打开资料](https://www.shopify.com/blog/customer-retention-strategies) |
| NN/g · Ten Usability Heuristics | [打开资料](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| NN/g · UX Interview Answers | [打开资料](https://www.nngroup.com/articles/answer-ux-job-interview-questions/) |
| W3C · Contrast Minimum | [打开资料](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) |
| NN/g · Design Systems 101 | [打开资料](https://www.nngroup.com/articles/design-systems-101/) |
| Adobe · Typography | [打开资料](https://www.adobe.com/creativecloud/design/discover/typography.html) |
| Adobe · Brand Identity | [打开资料](https://www.adobe.com/creativecloud/business/teams/resources/how-to/brand-identity.html) |
| NN/g · Animation and Motion | [打开资料](https://www.nngroup.com/articles/animation-purpose-ux/) |
| NN/g · Service Blueprints | [打开资料](https://www.nngroup.com/articles/service-blueprints-definition/) |
| OpenStax · Psychological Research | [打开资料](https://openstax.org/books/psychology-2e/pages/2-introduction) |
| Cochrane · Randomisation Review | [打开资料](https://www.cochrane.org/evidence/MR000012_randomised-controlled-trials-safeguard-against-biased-estimates-treatment-effects) |
| OpenStax · Measures of Intelligence | [打开资料](https://openstax.org/books/psychology-2e/pages/7-5-measures-of-intelligence) |
| APA · Industrial and Organizational Psychology | [打开资料](https://www.apa.org/ed/graduate/specialize/industrial) |
| APA · Pre-K to 12 Education | [打开资料](https://www.apa.org/education-career/k12) |
| NN/g · User Interviews | [打开资料](https://www.nngroup.com/articles/user-interviews/) |
| APA · Ethics Code | [打开资料](https://www.apa.org/ethics/code) |
| APA · Record Keeping | [打开资料](https://www.apa.org/practice/guidelines/record-keeping) |

## 0.1 版本面经调研存档

# 近期题库调研与证据边界

检索日期：2026-11-19。近一年窗口：2025-11-19 至 2026-11-19。当前调研是首版案例选题，不是全量抓取或统计报告。

## 近期资料线索

| 资料 | 时间信息 | 可用于什么 | 限制 |
|---|---|---|---|
| [牛客前端面经汇总](https://www.nowcoder.com/discuss/923168327453642752) | 正文列出 2026-02 至 2026-05 多个日期 | 虚拟列表、渲染、请求竞态等选题 | 用户汇总，未逐条核验原始面试；不能当独立样本计数 |
| [牛客 Java 汇总](https://www.nowcoder.com/discuss/864594486704291840) | 搜索索引显示约 2026-03，具体发布日期待确认 | 并发、索引、事务、Redis 模块线索 | 汇总文章，不能证明单题被哪家企业问过 |
| [面栈前端面经转载](https://mianstack.com/interview/mj-nc-2026-1398/?view=questions) | 页面标注 2026-09-22 | 事件循环与 AI 应用相关线索 | 转载；原帖与内容仍待核对 |
| [面栈后端面经转载](https://mianstack.com/interview/mj-nc-2026-0973/?view=questions) | 页面标注 2026-11-10 | 缓存与数据库一致性线索 | 转载；无法证明全公司频率 |

初步选题建议（编辑推断，不是统计结论）：前端按 JS/异步 → 框架渲染 → 网络与浏览器 → 性能与工程化组织；Java 后端按语言并发 → MySQL → Redis → Spring/JVM → 消息与系统设计组织。

## 首批案例

前端：事件循环、React render/commit、Effect 边界、请求竞态、动态高度虚拟列表。
Java 后端：联合索引与慢 SQL、MVCC 与锁、线程池过载、分布式锁。

每题技术来源随数据保存于 questions.js。经典知识可能早于窗口发布；本项目没有将其伪称为 2026 新题。示例代码用于讲解，不是完整生产方案。

## 企业高频统计应如何建立

未来为每条证据存储原帖 URL、作者/样本标识、企业、岗位、经验、轮次、面试日期、发布日期、检索日期和证据等级。按原帖与语义重复去重；以独立面试场次为分母，报告“样本内出现率”、样本量与时间窗口。转载和综合题单不计入独立面试样本。企业标签来自求职者自述，不能写成企业背书。

## 待补充的内容

- Spring 事务边界、JVM 排障、消息幂等与缓存一致性专题。
- Vue / TypeScript、网络安全、手写代码、算法与系统设计。
- 每个案例的初级回答、进阶追问、资深取舍三层评审。
- 真实面经来源、授权与失效链接维护机制。
- 题目评分维度和项目表达练习，不应只有标准答案。
