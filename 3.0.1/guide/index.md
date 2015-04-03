## 综述

针对一些需要说明的图或页面区域，我们通常会添加一些tip来说明或备注，一般为了方便，都会选择用图片直接贴上去。本组件这是使用svg+css3来实现具有动画效果的引导性tip（而这里的tip内容则是使用原生的html实现~），详见demo。

## 初始化组件
```
	// 初级配置（使用组件默认参数）
    S.use('kg/lineTip/3.0.1/index', function (S, Fromtochart) {

        var lineTip = new LineTip();

        lineTip.add({
            points: [
                [0, 0],     // [必须] 起始圆环位置，默认且必须写为[0, 0]
                [100, 0],   // [必须] 中间连线拐点位置(x为正值，表示向右延伸)
                [150, -100] // [必须] 末了圆环位置（x为正值，y为负值，表示向右上延伸）
            ],

            html: {
                width: 200,       // [必须] 模板宽度
                height: 200,      // [必须] 模板高度
                tpl: function() { // [必须] 返回模板内容
                    return '<div style="padding:5px">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs</div>';
                }
            }
        });
    });
```

## 高级配置

```
    // 需要在实例化时，加入初始配置参数
    var lineTip = new LineTip({
        points: {               // 圆环配置
            color: "#fff",      // 圆环颜色
            size: 2,            // 圆环尺寸
            radius: 4,          // 圆环半径，单位px
            opacity: 0.8,       // 圆环透明度
            animateTime: 0.5,   // 圆环持续时间
            animateType: "ease" // 圆环动画速度类型，同css3
        },
        line: {                 // 线条配置
            color: "#fff",      // 圆环颜色
            size: 2,            // 圆环尺寸
            opacity: 0.6,       // 圆环透明度
            animateTime: 1,     // 圆环持续时间
            animateType: "ease" // 圆环动画速度类型，同css3
        }
    });
```
