## Nebulas Magic Scroll

### Introduction
Nebulas Magic Scroll is a Dapp deployed on Nebulas mainet. You can use it to encrypt your secret content， then you can share it

### Dapp Structure
#### Smart contract

1. 生成卷轴。相当于生成一条微博的付费链接（当然也可以设置成免费的）。用户将内容前端加密后存入区块链。合约通过预先生成k-v的加密参数值，用户写入内容时在前端使用随机返回的加密参数进行加密后存入到星云链。
2. 分享卷轴。用户将生成的卷轴对应的key值分享，打开后可以看到介绍信息。
3. 开启卷轴。如卷轴设置了价格，则需要发起付费，费用的99%将给卷轴主人地址，1%作为服务费给合约创建者。
4. 查看卷轴内容。 免费卷轴可直接点击查看原始内容，付费卷轴通过付费开启后获得查看资格即可点击查看。


1.首页 index.html 填写要封印的内容并点击生成卷轴。交易成功后获得生成的key，跳转页面show.html?key=***** ，上面除了卷轴内容不显示外其他介绍性内容都会展现。

2.分享show.html?key =***** 的链接给其他用户，其他用户点击到该页面。

3. 查看卷轴内容。如卷轴免费，直接点击查看可以看到卷轴内容。如需付费则先点击付费获取资格（付费收取1%的服务费），交易成功后，再点击查看既可以看到。
（用户再次查看只需填入已付款的钱包地址即可）
