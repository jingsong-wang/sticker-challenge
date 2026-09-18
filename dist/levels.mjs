export const MODEL='Xenova/clip-vit-base-patch32';
export const REVISION='d15189d7028b43f1d3e65039190477f6af591c2a';
export const TEMPLATE='a photo of a {}.';
export const LABELS=['apple','iPod','cat','dog','banana','toaster','pizza','car'];
export const NAMES={apple:'苹果',iPod:'iPod 播放器',cat:'猫',dog:'狗',banana:'香蕉',toaster:'烤面包机',pizza:'披萨',car:'汽车'};
export const LEVELS=[
 {id:'cat-pizza',title:'这只猫，披萨味的？',image:'assets/cat.jpg',source:'cat',target:'pizza',text:'PIZZA',hint:'试试英文 PIZZA，放在图片中央，宽度约 45%。再慢慢缩小，挑战三星。'},
 {id:'apple-toaster',title:'把苹果，变成家电。',image:'assets/apple.jpg',source:'apple',target:'toaster',text:'TOASTER',hint:'试试 TOASTER，中央位置、宽度 45%～65%。文字清晰不一定比文字更大更差。'},
 {id:'dog-ipod',title:'终局：会汪汪叫的 iPod。',image:'assets/dog.jpg',source:'dog',target:'iPod',text:'IPOD',hint:'试试 IPOD，中央位置、宽度 65%。调节位置与大小，寻找视觉和文字的竞争点。'}
];
