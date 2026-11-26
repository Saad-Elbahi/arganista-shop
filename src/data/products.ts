import type { L } from "@/i18n/config";

export type CategoryKey = "huiles" | "serums" | "visage" | "hammam" | "cheveux" | "terroir";
export type IngredientKey = "argan" | "rose" | "figue" | "oranger" | "ghassoul" | "aloe";

export type Variant = { id: string; label?: string; price: number; compareAt?: number; inStock?: boolean };

export type Product = {
  /** database id (absent in the starter catalog) */
  id?: string;
  slug: string;
  category: CategoryKey;
  ingredients: IngredientKey[];
  variants: Variant[];
  badges?: ("best" | "new")[];
  name: L;
  tagline: L;
  description: L;
  howTo: L;
  keyIngredients: L;
  /** Label colour used as a soft tint behind the product */
  tint: string;
  /** Studio photos (1200×1500); the first is the main image */
  images: string[];
  /** Photo to show when a given size is selected */
  variantImages?: Record<string, string>;
};

export const categories: { key: CategoryKey; slug: string }[] = [
  { key: "huiles", slug: "huile-argan-cosmetique-bio" },
  { key: "serums", slug: "serum-anti-rides-rose" },
  { key: "visage", slug: "creme-visage-rose" },
  { key: "hammam", slug: "pate-ghassouline-rose" },
  { key: "cheveux", slug: "shampoing-argan-fleur-oranger" },
  { key: "terroir", slug: "huile-argan-alimentaire" },
];

// Starter catalog: used to seed the database (scripts/gen-seed.ts) and as a
// fallback when Supabase is not configured. Manage live products in /admin.
export const products: Product[] = [
  {
    slug: "huile-argan-cosmetique-bio",
    images: ["/images/catalog/argan-100ml.jpg", "/images/catalog/argan-gamme.jpg"],
    category: "huiles",
    ingredients: ["argan"],
    variants: [
      { id: "30ml", label: "30 ml", price: 89 },
      { id: "100ml", label: "100 ml", price: 199 },
    ],
    badges: ["best"],
    tint: "#f1e3d6",
    name: { fr: "Huile d'Argan Cosmétique Bio", en: "Organic Cosmetic Argan Oil", ar: "زيت الأركان التجميلي العضوي" },
    tagline: {
      fr: "L'or liquide du Souss, pressé à froid",
      en: "Cold-pressed liquid gold from the Souss",
      ar: "الذهب السائل من سوس، معصور على البارد",
    },
    description: {
      fr: "Notre huile d'argan pure, pressée à froid par les femmes de la coopérative. Riche en vitamine E et en acides gras essentiels, elle nourrit, assouplit et illumine la peau, les cheveux et les ongles.",
      en: "Our pure argan oil, cold-pressed by the women of the cooperative. Rich in vitamin E and essential fatty acids, it nourishes, softens and brightens skin, hair and nails.",
      ar: "زيت أركان نقي معصور على البارد من طرف نساء التعاونية. غني بفيتامين E والأحماض الدهنية الأساسية، يغذّي البشرة والشعر والأظافر ويمنحها نعومة وإشراقًا.",
    },
    howTo: {
      fr: "Visage : 2 à 3 gouttes matin et soir sur peau propre. Cheveux : quelques gouttes sur les pointes, ou en bain d'huile avant le shampoing.",
      en: "Face: 2–3 drops morning and night on clean skin. Hair: a few drops on the ends, or as a pre-shampoo oil treatment.",
      ar: "للوجه: 2 إلى 3 قطرات صباحًا ومساءً على بشرة نظيفة. للشعر: بضع قطرات على الأطراف أو كحمّام زيت قبل الشامبو.",
    },
    keyIngredients: { fr: "100 % huile d'argan (Argania spinosa) bio", en: "100% organic argan oil (Argania spinosa)", ar: "زيت أركان عضوي 100٪" },
  },
  {
    slug: "huile-pepins-figue-de-barbarie-bio",
    images: ["/images/catalog/figue-15ml.jpg", "/images/catalog/figue-30ml.jpg", "/images/catalog/figue-gamme.jpg"],
    variantImages: { "15ml": "/images/catalog/figue-15ml.jpg", "30ml": "/images/catalog/figue-30ml.jpg" },
    category: "huiles",
    ingredients: ["figue"],
    variants: [
      { id: "15ml", label: "15 ml", price: 249 },
      { id: "30ml", label: "30 ml", price: 449 },
    ],
    badges: ["best"],
    tint: "#e2e8df",
    name: { fr: "Huile de Pépins de Figue de Barbarie Bio", en: "Organic Prickly Pear Seed Oil", ar: "زيت بذور التين الشوكي العضوي" },
    tagline: {
      fr: "Le soin anti-âge le plus précieux du désert",
      en: "The desert's most precious anti-ageing oil",
      ar: "أثمن زيت لمكافحة الشيخوخة من الصحراء",
    },
    description: {
      fr: "Il faut près d'une tonne de fruits pour obtenir un litre de cette huile rare. Exceptionnellement riche en vitamine E et en stérols, elle lisse les traits, atténue les ridules et redonne éclat au teint.",
      en: "Nearly a tonne of fruit is needed for one litre of this rare oil. Exceptionally rich in vitamin E and sterols, it smooths features, softens fine lines and restores radiance.",
      ar: "يتطلّب لتر واحد من هذا الزيت النادر قرابة طن من الثمار. غني جدًا بفيتامين E والستيرولات، ينعّم الملامح ويخفّف الخطوط الدقيقة ويعيد للبشرة إشراقها.",
    },
    howTo: {
      fr: "Appliquer 2 à 3 gouttes le soir sur le visage, le cou et le contour des yeux, en massant délicatement.",
      en: "Apply 2–3 drops in the evening to face, neck and eye area, massaging gently.",
      ar: "ضعي 2 إلى 3 قطرات مساءً على الوجه والعنق ومحيط العينين مع تدليك لطيف.",
    },
    keyIngredients: {
      fr: "100 % huile de pépins de figue de barbarie (Opuntia ficus-indica) bio",
      en: "100% organic prickly pear seed oil (Opuntia ficus-indica)",
      ar: "زيت بذور التين الشوكي العضوي 100٪",
    },
  },
  {
    slug: "serum-anti-rides-rose",
    images: ["/images/catalog/serum-anti-rides.jpg", "/images/catalog/serum-anti-rides-gamme.jpg"],
    category: "serums",
    ingredients: ["rose", "argan"],
    variants: [{ id: "50ml", label: "50 ml", price: 179 }],
    badges: ["best"],
    tint: "#f4e1de",
    name: { fr: "Sérum Anti-Rides à la Rose", en: "Rose Anti-Wrinkle Serum", ar: "سيروم مضاد للتجاعيد بالورد" },
    tagline: { fr: "Fermeté et douceur à la rose de Damas", en: "Firmness and softness with Damask rose", ar: "شدّ ونعومة بالورد الدمشقي" },
    description: {
      fr: "Un sérum huileux léger qui associe la rose et l'argan pour raffermir la peau, atténuer les rides et laisser un parfum floral délicat.",
      en: "A light oil serum pairing rose and argan to firm the skin, soften wrinkles and leave a delicate floral scent.",
      ar: "سيروم زيتي خفيف يجمع الورد والأركان لشدّ البشرة وتخفيف التجاعيد مع رائحة زهرية رقيقة.",
    },
    howTo: {
      fr: "Matin et/ou soir, appliquer quelques gouttes sur le visage et le cou propres, puis masser en mouvements ascendants.",
      en: "Morning and/or night, apply a few drops to clean face and neck and massage upwards.",
      ar: "صباحًا و/أو مساءً، ضعي بضع قطرات على الوجه والعنق النظيفين ودلّكي بحركات صاعدة.",
    },
    keyIngredients: { fr: "Rose, huile d'argan", en: "Rose, argan oil", ar: "الورد، زيت الأركان" },
  },
  {
    slug: "serum-anti-age-argan-figue-vitamine-e",
    images: ["/images/catalog/serum-anti-age.jpg", "/images/catalog/serum-anti-age-gamme.jpg"],
    category: "serums",
    ingredients: ["argan", "figue"],
    variants: [{ id: "50ml", label: "50 ml", price: 219 }],
    badges: ["new"],
    tint: "#ece3d4",
    name: {
      fr: "Sérum Anti-Âge Argan, Figue de Barbarie & Vitamine E",
      en: "Anti-Ageing Serum — Argan, Prickly Pear & Vitamin E",
      ar: "سيروم مضاد للشيخوخة — أركان، تين شوكي وفيتامين E",
    },
    tagline: { fr: "Le trio régénérant", en: "The regenerating trio", ar: "الثلاثي المجدّد" },
    description: {
      fr: "L'alliance de l'argan, de la figue de barbarie et de la vitamine E pour régénérer la peau, préserver son élasticité et lutter contre les signes de l'âge.",
      en: "Argan, prickly pear and vitamin E combine to regenerate skin, preserve elasticity and fight the signs of ageing.",
      ar: "مزيج الأركان والتين الشوكي وفيتامين E لتجديد البشرة والحفاظ على مرونتها ومحاربة علامات التقدّم في السن.",
    },
    howTo: {
      fr: "Le soir, appliquer 3 à 4 gouttes sur le visage et le cou, avant votre crème.",
      en: "In the evening, apply 3–4 drops to face and neck before your moisturiser.",
      ar: "مساءً، ضعي 3 إلى 4 قطرات على الوجه والعنق قبل الكريم.",
    },
    keyIngredients: {
      fr: "Huile d'argan, huile de pépins de figue de barbarie, vitamine E",
      en: "Argan oil, prickly pear seed oil, vitamin E",
      ar: "زيت الأركان، زيت بذور التين الشوكي، فيتامين E",
    },
  },
  {
    slug: "creme-visage-rose",
    images: ["/images/catalog/creme-visage-rose.jpg"],
    category: "visage",
    ingredients: ["rose"],
    variants: [{ id: "std", price: 149 }],
    tint: "#f4e1de",
    name: { fr: "Crème Visage à la Rose", en: "Rose Face Cream", ar: "كريم الوجه بالورد" },
    tagline: { fr: "Hydratation douce au quotidien", en: "Gentle everyday hydration", ar: "ترطيب لطيف يومي" },
    description: {
      fr: "Une crème douce à la rose qui hydrate, apaise et préserve la douceur de la peau. Sa texture fond délicatement et laisse le teint frais.",
      en: "A gentle rose cream that hydrates, soothes and preserves the skin's softness. Its texture melts in and leaves the complexion fresh.",
      ar: "كريم لطيف بالورد يرطّب ويهدّئ ويحافظ على نعومة البشرة. قوامه يذوب برقة ويترك البشرة منتعشة.",
    },
    howTo: {
      fr: "Appliquer matin et soir sur le visage et le cou, en massant délicatement jusqu'à absorption.",
      en: "Apply morning and night to face and neck, massaging gently until absorbed.",
      ar: "ضعيه صباحًا ومساءً على الوجه والعنق مع تدليك لطيف حتى يمتصّ.",
    },
    keyIngredients: { fr: "Eau de rose, glycérine", en: "Rose water, glycerin", ar: "ماء الورد، الغليسرين" },
  },
  {
    slug: "creme-anti-rides-argan-rose",
    images: ["/images/catalog/creme-visage-rose.jpg"],
    category: "visage",
    ingredients: ["argan", "rose"],
    variants: [{ id: "std", price: 169 }],
    tint: "#ece3d4",
    name: { fr: "Crème Anti-Rides Argan & Rose", en: "Argan & Rose Anti-Wrinkle Cream", ar: "كريم مضاد للتجاعيد أركان وورد" },
    tagline: { fr: "Nourrit et lisse les traits", en: "Nourishes and smooths", ar: "يغذّي وينعّم الملامح" },
    description: {
      fr: "La richesse de l'argan et la délicatesse de la rose dans une crème nourrissante qui aide à lisser les rides et à raffermir la peau.",
      en: "The richness of argan and the delicacy of rose in a nourishing cream that helps smooth wrinkles and firm the skin.",
      ar: "غنى الأركان ورقّة الورد في كريم مغذٍّ يساعد على تنعيم التجاعيد وشدّ البشرة.",
    },
    howTo: {
      fr: "Appliquer le soir sur peau propre, en insistant sur les zones de rides.",
      en: "Apply in the evening on clean skin, focusing on lined areas.",
      ar: "ضعيه مساءً على بشرة نظيفة مع التركيز على مناطق التجاعيد.",
    },
    keyIngredients: { fr: "Huile d'argan, rose", en: "Argan oil, rose", ar: "زيت الأركان، الورد" },
  },
  {
    slug: "gel-nettoyant-visage-aloe-rose",
    images: ["/images/catalog/gel-nettoyant.jpg", "/images/catalog/gel-nettoyant-gamme.jpg"],
    category: "visage",
    ingredients: ["aloe", "rose"],
    variants: [{ id: "100ml", label: "100 ml", price: 99 }],
    badges: ["new"],
    tint: "#ece3d4",
    name: { fr: "Gel Nettoyant Visage Aloe Vera & Rose", en: "Aloe Vera & Rose Face Cleansing Gel", ar: "جل منظف للوجه بالصبار والورد" },
    tagline: { fr: "Une peau nette, jamais tiraillée", en: "Clean skin that never feels tight", ar: "بشرة نقية دون شدّ" },
    description: {
      fr: "Un gel frais qui élimine impuretés et maquillage tout en respectant l'équilibre de la peau, grâce à l'aloe vera apaisant et à la rose.",
      en: "A fresh gel that removes impurities and make-up while respecting the skin's balance, thanks to soothing aloe vera and rose.",
      ar: "جل منعش يزيل الشوائب والمكياج مع احترام توازن البشرة بفضل الصبار المهدّئ والورد.",
    },
    howTo: {
      fr: "Faire mousser une noisette avec un peu d'eau, masser le visage humide puis rincer. Matin et soir.",
      en: "Lather a small amount with water, massage onto damp face and rinse. Morning and night.",
      ar: "رغّي كمية صغيرة بالماء، دلّكي الوجه المبلل ثم اشطفي. صباحًا ومساءً.",
    },
    keyIngredients: { fr: "Aloe vera, rose", en: "Aloe vera, rose", ar: "الصبار، الورد" },
  },
  {
    slug: "pate-ghassouline-rose",
    images: ["/images/catalog/ghassoul-rose.jpg"],
    category: "hammam",
    ingredients: ["ghassoul", "rose", "argan"],
    variants: [{ id: "std", price: 69 }],
    tint: "#e7e1e6",
    name: { fr: "Pâte Ghassouline à la Rose", en: "Rose Ghassoul Clay Paste", ar: "عجينة الغاسول بالورد" },
    tagline: { fr: "Le rituel du hammam, prêt à l'emploi", en: "The hammam ritual, ready to use", ar: "طقس الحمّام، جاهز للاستعمال" },
    description: {
      fr: "Le ghassoul, argile volcanique du Moyen Atlas, purifie la peau en douceur. Enrichi à la rose et à l'huile d'argan, il laisse la peau fraîche et délicatement parfumée.",
      en: "Ghassoul, a volcanic clay from the Middle Atlas, gently purifies the skin. Enriched with rose and argan oil, it leaves skin fresh and delicately scented.",
      ar: "الغاسول، طين بركاني من الأطلس المتوسط، ينقّي البشرة بلطف. مُعزّز بالورد وزيت الأركان، يترك البشرة منتعشة بعطر رقيق.",
    },
    howTo: {
      fr: "Appliquer sur peau humide (visage, corps ou cheveux), laisser poser 5 à 10 minutes puis rincer à l'eau tiède.",
      en: "Apply to damp skin (face, body or hair), leave for 5–10 minutes, then rinse with warm water.",
      ar: "ضعيها على بشرة مبللة (الوجه، الجسم أو الشعر)، اتركيها 5 إلى 10 دقائق ثم اشطفي بماء فاتر.",
    },
    keyIngredients: { fr: "Ghassoul (argile du Maroc), huile d'argan, rose", en: "Moroccan lava clay, argan oil, rose", ar: "الغاسول المغربي، زيت الأركان، الورد" },
  },
  {
    slug: "pate-ghassouline-fleur-oranger",
    images: ["/images/catalog/ghassoul-fleur-oranger.jpg"],
    category: "hammam",
    ingredients: ["ghassoul", "oranger", "argan"],
    variants: [{ id: "std", price: 69 }],
    tint: "#e7e1e6",
    name: { fr: "Pâte Ghassouline à la Fleur d'Oranger", en: "Orange Blossom Ghassoul Clay Paste", ar: "عجينة الغاسول بزهر الليمون" },
    tagline: { fr: "Purifiante et délicatement parfumée", en: "Purifying and delicately scented", ar: "منقّية بعطر رقيق" },
    description: {
      fr: "Une pâte de ghassoul onctueuse, parfumée à la fleur d'oranger, qui élimine les impuretés en douceur et laisse la peau douce comme après un hammam.",
      en: "A creamy ghassoul paste scented with orange blossom that gently removes impurities and leaves skin soft, just like after a hammam.",
      ar: "عجينة غاسول ناعمة بعطر زهر الليمون، تزيل الشوائب بلطف وتترك البشرة ناعمة كما بعد الحمّام.",
    },
    howTo: {
      fr: "Appliquer sur peau humide, laisser poser 5 à 10 minutes puis rincer.",
      en: "Apply to damp skin, leave for 5–10 minutes, then rinse.",
      ar: "ضعيها على بشرة مبللة، اتركيها 5 إلى 10 دقائق ثم اشطفي.",
    },
    keyIngredients: { fr: "Ghassoul, huile d'argan, fleur d'oranger", en: "Ghassoul clay, argan oil, orange blossom", ar: "الغاسول، زيت الأركان، زهر الليمون" },
  },
  {
    slug: "shampoing-argan-fleur-oranger",
    images: ["/images/catalog/shampoing.jpg", "/images/catalog/shampoing-gamme.jpg"],
    category: "cheveux",
    ingredients: ["argan", "oranger"],
    variants: [{ id: "100ml", label: "100 ml", price: 89 }],
    tint: "#f3dcd0",
    name: { fr: "Shampoing Argan & Fleur d'Oranger", en: "Argan & Orange Blossom Shampoo", ar: "شامبو الأركان وزهر الليمون" },
    tagline: { fr: "Tout type de cheveux", en: "For all hair types", ar: "لجميع أنواع الشعر" },
    description: {
      fr: "Un shampoing doux qui lave sans agresser. L'huile d'argan nourrit la fibre, la fleur d'oranger laisse un parfum frais et lumineux.",
      en: "A gentle shampoo that cleanses without stripping. Argan oil nourishes the fibre while orange blossom leaves a fresh, bright scent.",
      ar: "شامبو لطيف ينظّف دون أن يؤذي. زيت الأركان يغذّي الشعر وزهر الليمون يترك عطرًا منعشًا.",
    },
    howTo: {
      fr: "Appliquer sur cheveux mouillés, faire mousser, puis rincer. Renouveler si nécessaire.",
      en: "Apply to wet hair, lather, then rinse. Repeat if needed.",
      ar: "ضعيه على شعر مبلل، رغّيه ثم اشطفي. كرّري عند الحاجة.",
    },
    keyIngredients: { fr: "Huile d'argan, fleur d'oranger", en: "Argan oil, orange blossom", ar: "زيت الأركان، زهر الليمون" },
  },
  {
    slug: "huile-argan-alimentaire",
    images: ["/images/catalog/huile-alimentaire-250ml.jpg", "/images/catalog/huile-alimentaire-gamme.jpg", "/images/catalog/huile-alimentaire-500ml.jpg", "/images/catalog/huile-alimentaire-1l.jpg"],
    variantImages: { "250ml": "/images/catalog/huile-alimentaire-250ml.jpg", "500ml": "/images/catalog/huile-alimentaire-500ml.jpg", "1l": "/images/catalog/huile-alimentaire-1l.jpg" },
    category: "terroir",
    ingredients: ["argan"],
    variants: [
      { id: "250ml", label: "250 ml", price: 129 },
      { id: "500ml", label: "500 ml", price: 229 },
      { id: "1l", label: "1 L", price: 419 },
    ],
    tint: "#ece3d4",
    name: { fr: "Huile d'Argan Alimentaire Torréfiée", en: "Toasted Culinary Argan Oil", ar: "زيت الأركان الغذائي المحمّص" },
    tagline: { fr: "Pure et naturelle, au goût de noisette", en: "Pure and natural, with a nutty taste", ar: "نقي وطبيعي بنكهة البندق" },
    description: {
      fr: "Obtenue à partir d'amandes d'argan légèrement torréfiées, cette huile au goût de noisette sublime salades, couscous, tajines et petits-déjeuners.",
      en: "Made from lightly toasted argan kernels, this nutty oil elevates salads, couscous, tagines and breakfasts.",
      ar: "مستخلص من لوز الأركان المحمّص قليلًا، بنكهة البندق التي ترتقي بالسلطات والكسكس والطاجين ووجبات الفطور.",
    },
    howTo: {
      fr: "À consommer cru : en filet sur vos plats, avec du pain ou mélangé au miel et aux amandes.",
      en: "Enjoy raw: drizzled over dishes, with bread, or mixed with honey and almonds.",
      ar: "يُستهلك نيئًا: على الأطباق، مع الخبز أو ممزوجًا بالعسل واللوز.",
    },
    keyIngredients: { fr: "100 % huile d'argan torréfiée", en: "100% toasted argan oil", ar: "زيت أركان محمّص 100٪" },
  },
  {
    slug: "amlou-beldi",
    images: ["/images/catalog/amlou-beldi.jpg"],
    category: "terroir",
    ingredients: ["argan"],
    variants: [{ id: "std", price: 99 }],
    tint: "#ece3d4",
    name: { fr: "Amlou Beldi", en: "Traditional Amlou", ar: "أملو بلدي" },
    tagline: { fr: "Amandes, argan et miel", en: "Almonds, argan and honey", ar: "لوز، أركان وعسل" },
    description: {
      fr: "La pâte à tartiner traditionnelle du Souss : amandes grillées, huile d'argan et miel, broyés selon la recette d'antan.",
      en: "The traditional spread of the Souss: toasted almonds, argan oil and honey, ground the old-fashioned way.",
      ar: "الدهن التقليدي لسوس: لوز محمّص وزيت أركان وعسل، مطحونة على الطريقة القديمة.",
    },
    howTo: {
      fr: "À tartiner sur du pain, du msemen ou des crêpes au petit-déjeuner.",
      en: "Spread on bread, msemen or pancakes at breakfast.",
      ar: "يُدهن على الخبز أو المسمن أو البغرير في الفطور.",
    },
    keyIngredients: { fr: "Amandes, huile d'argan, miel", en: "Almonds, argan oil, honey", ar: "لوز، زيت أركان، عسل" },
  },
];

export const imageFor = (p: Product, variantId?: string) => (variantId && p.variantImages?.[variantId]) || p.images[0];

export const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));

export const categoryKeys = categories.map((c) => c.key);
export const ingredientKeys: IngredientKey[] = ["argan", "rose", "figue", "oranger", "ghassoul", "aloe"];
export const inStock = (p: Product) => p.variants.some((v) => v.inStock !== false);
