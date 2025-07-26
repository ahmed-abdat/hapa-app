import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateMeta } from '@/utilities/generateMeta'
import { getLocaleDirection, type Locale } from '@/utilities/locale'
import { notFound } from 'next/navigation'
import BackToTopButton from './BackToTopButton'

type Args = {
  params: Promise<{
    locale: string
  }>
}

export default async function BylawsPage({ params: paramsPromise }: Args) {
  const { locale } = await paramsPromise
  
  if (locale !== 'fr' && locale !== 'ar') {
    notFound()
  }
  
  const direction = getLocaleDirection(locale as Locale)
  const t = await getTranslations()
  
  const bylawsData = {
    fr: {
      title: t('internalRegulations'),
      subtitle: t('regulatoryFramework'),
      intro: t('organizedSystem'),
      
      chapters: [
        {
          title: "Dispositions Générales",
          icon: "general",
          color: "from-blue-500 to-blue-600",
          description: "Fondements légaux et cadre institutionnel",
          articles: [
            {
              number: "Article 1",
              content: "Ce règlement intérieur est pris en application de la loi 2008/026 portant création de l'Autorité Supérieure de la Presse et de l'Audiovisuel et de l'ordonnance n° 2006/17 sur la liberté de la presse."
            },
            {
              number: "Article 2", 
              content: "Il détermine l'organisation et le fonctionnement de l'Autorité Supérieure de la Presse et de l'Audiovisuel."
            },
            {
              number: "Article 3",
              content: "Il est approuvé par le Conseil de l'Autorité Supérieure de la Presse et de l'Audiovisuel conformément à l'article 19 de la loi 2008/026."
            },
            {
              number: "Article 4",
              content: "Les organes de l'Autorité Supérieure de la Presse et de l'Audiovisuel sont :",
              items: [
                "Le Conseil de l'Autorité Supérieure de la Presse et de l'Audiovisuel",
                "Les commissions spécialisées",
                "L'administration de l'Autorité Supérieure de la Presse et de l'Audiovisuel"
              ]
            }
          ]
        },
        {
          title: "Le Conseil",
          icon: "council",
          color: "from-primary to-accent",
          description: "Organisation et fonctionnement du Conseil",
          articles: [
            {
              number: "Article 5",
              content: "Le Conseil est l'organe de conception et d'orientation de l'Autorité Supérieure. Ses compétences sont notamment :",
              items: [
                "Définir les orientations générales de l'institution",
                "Approuver le budget annuel et le programme de travail",
                "Adopter la structuration administrative",
                "Préparer le rapport général annuel",
                "Exercer le pouvoir d'enquête",
                "Prononcer des sanctions",
                "Rendre des décisions sur les différends"
              ]
            },
            {
              number: "Article 6",
              content: "Le Conseil se réunit sur convocation de son président en session hebdomadaire ordinaire et selon les besoins."
            }
          ]
        }
      ],
      
      backToTop: t('backToTop')
    },
    ar: {
      title: t('internalRegulations'),
      subtitle: t('regulatoryFramework'),
      intro: t('organizedSystem'),
      
      chapters: [
        {
          title: "ترتيبات عامة",
          icon: "general",
          color: "from-blue-500 to-blue-600",
          description: "الأسس القانونية والإطار المؤسسي",
          articles: [
            {
              number: "المادة 1",
              content: "يتخذ هذا النظام الداخلي للقانون 2008/026 المنشئ للسلطة العليا للصحافة والسمعيات البصرية والأمر القانوني رقم 2006/17 حول حرية الصحافة."
            },
            {
              number: "المادة 2",
              content: "يحدد تنظيم السلطة العليا للصحافة والسمعيات البصرية وسيرها."
            },
            {
              number: "المادة 3",
              content: "يصادق عليه مجلس السلطة العليا للصحافة والسمعيات البصرية طبقا للمادة 19 من القانون 2008/026."
            },
            {
              number: "المادة 4",
              content: "هيئات السلطة العليا للصحافة والسمعيات البصرية هي:",
              items: [
                "مجلس السلطة العليا للصحافة والسمعيات البصرية",
                "اللجان المخصصة",
                "إدارة السلطة العليا للصحافة والسمعيات البصرية"
              ]
            }
          ]
        },
        {
          title: "ترتيبات تتعلق بالمجلس",
          icon: "council",
          color: "from-primary to-accent",
          description: "تنظيم وسير عمل المجلس",
          articles: [
            {
              number: "المادة 5",
              content: "المجلس هو هيئة التصور والتوجيه في السلطة العليا للصحافة والسمعيات البصرية تحدد صلاحياتها وامتيازاتها في المادة 19 من القانون 2008/026 وتتمثل خصوصا في:",
              items: [
                "تحديد التوجهات العامة للمؤسسة",
                "المصادقة على الميزانية السنوية وبرنامج العمل السنوي",
                "اعتماد الهيكلة الإدارية والنظام الداخلي ومخططات الاكتتاب والنظام الأساسي وجدول الرواتب وامتيازات العمال",
                "إعداد التقرير العام السنوي",
                "تنفيذ سلطة التحقيق الممنوحة للسلطة العليا",
                "إصدار العقوبات في حالات مخالفة الترتيبات التشريعية والتنظيمية أو مضامين التراخيص والإجازات والامتيازات ودفاتر الالتزامات",
                "إصدار القرارات بشأن الخلافات التي تعرض عليها وإيجاد الصيغ التوافقية المطلوبة",
                "الاضطلاع بأية وظائف أخرى تعهد بها إليها القوانين المعمول بها"
              ]
            },
            {
              number: "المادة 6",
              content: "يجتمع المجلس بدعوة من رئيسه أو كل يوم في دورة أسبوعية عادية وكلما دعت الضرورة إلى ذلك. وفي حال غياب الرئيس بسبب أي مانع ينعقد المجلس تحت رئاسة العضو الأسن من بين الحاضرين."
            },
            {
              number: "المادة 7",
              content: "يعتمد جدول أعمال المجلس من طرف الرئيس بيوم على الأقل قبل انعقاد المجلس ويتم إرساله بعد ذلك إلى الأعضاء إذا لم تكن هنالك حالة استعجاليه. بوسع كل عضو أن يضيف نقطة أو عدة نقاط إلى جدول الأعمال على أن يشعر الرئيس في الوقت المناسب ويقدم له المعلومات الضرورية لمناقشة الموضوع المقترح. يمكن أن يشتمل جدول الأعمال على بند «قضايا متفرقة». إن كل نقطة لم تتسنى مناقشتها خلال اجتماع ما، تسجل تلقائيا في جدول أعمال الاجتماع الموالي. إلا انه عندما يكون التأجيل ناتجا عن ضرورة الحصول على معلومات إضافية فان القضية المذكورة تدرج ضمن جدول أعمال الجلسة التي يكون المجلس قد حصل قبلها على العناصر الضرورية. يتم إعداد وثائق الجلسة تحت إشراف الأمين العام على أن تحال إلى الأعضاء قبل الجلسة بأربع وعشرين ساعة (24) باستثناء الحالات الاستعجالية."
            },
            {
              number: "المادة 8",
              content: "لا تتم مداولات المجلس إلا بحضور أربعة أعضاء على الأقل. تعتمد قرارات وتوصيات وملاحظات وآراء المجلس عن طريق التصويت بأغلبية الأعضاء الحاضرين. وفي حال تعادل الأصوات يعتبر صوت رئيس مرجحا."
            },
            {
              number: "المادة 9",
              content: "تعلق الجلسات بطلب من الرئيس أو من ثلثي أعضاء المجلس."
            },
            {
              number: "المادة 10",
              content: "تعتبر مداولات المجلس سرية."
            },
            {
              number: "المادة 11",
              content: "يحضر الأمين العام مداولات المجلس كما يمكنه بموافقة المجلس، أن يستدعي لها الخبراء أو العمال الذين يعتبر حضورهم ضروريا لحسن سير المداولات. إلا أن الوكلاء المعنيين ينسحبون قبل أي مداولات أو قرار."
            },
            {
              number: "المادة 12",
              content: "بإمكان الرئيس أن يعهد إلى الأعضاء بمهمات خاصة تتعلق بصلاحيات المجلس."
            },
            {
              number: "المادة 13",
              content: "تستدعي المجلس أي طرف يرى من الضروري الاستماع إليه. ويقضي ذلك الاستماع إلى تحرير محاضر موقعة من طرف الأعضاء الحاضرين والشخص المستمع إليه."
            },
            {
              number: "المادة 14",
              content: "تتولى إدارة السلطة تحضير ومتابعة اجتماعات المجلس وذلك فيما يلي:",
              items: [
                "تأمين وتنسيق تسيير الجدول الزمني لاجتماعات المجلس",
                "تحضير جدول أعمال اجتماعات المجلس",
                "إعداد ملفات الجلسات",
                "تحضير ومتابعة الاستدعاءات",
                "التكفل بنشر المحاضر",
                "تحضير وتحيين وتأمين الوثائق والسجلات",
                "تسيير مراسلات المجلس",
                "تسيير نصوص النشرة الخاصة"
              ]
            },
            {
              number: "المادة 15",
              content: "يلزم الأعضاء بالحفاظ على سرية الأحداث والوقائع والمعلومات التي قد يضطلعون عليها خلال اجتماعات المجلس أو بشكل عام خلال مباشرتهم لمهامهم. كما يحظر عليهم اعتماد موقف علني إزاء القضايا ذات الصلة باختصاص المجلس وذلك طبقا للحياد الذي نص عليه النظام الأساسي."
            },
            {
              number: "المادة 16",
              content: "يطالب الرئيس والأعضاء وكذلك عمال السلطة العليا للصحافة والسمعيات البصرية بإبلاغ المجلس عن أي حالة من شأنها المساس باستقلاليتهم. وفي حالة تضارب المصالح يطالب كل عضو في الجمعية العلنية أو عامل من عمال السلطة العليا بالامتناع عن التدخل في التحقيقات أو المراقبة تحت طائلة إلغاء المداولات والتعليمات. وان على الرئيس والأعضاء والأمين العام إبلاغ المجلس عن مثل تلك الحالات في حين يطالب العمال بإبلاغ رؤسائهم. إن الاتصال المؤسسي المتعلق بممارسة صلاحيات السلطة العليا يعتبر من اختصاص الرئيس الذي بوسعه تكليف أي عضو يختاره لهذا الغرض. يعتبر الرئيس الناطق الرسمي باسم المجلس - يعرض للمداولات قبل نشره للجمهور."
            }
          ]
        },
        {
          title: "إجراءات تتعلق بالقرارات والآراء",
          icon: "decisions",
          color: "from-purple-500 to-purple-600",
          description: "آليات اتخاذ القرارات والآراء",
          articles: [
            {
              number: "المادة 17",
              content: "تسجل القرارات المؤرخة والموقعة من قبل الرئيس تحت رقم تسلسلي ضمن سجل خاص."
            },
            {
              number: "المادة 18",
              content: "تنشر نسخ من القرارات المذكورة في المادة السابقة في النشرة الخاصة للسلطة العليا للصحافة والسمعيات البصرية المنصوص عليها في المادة 09 من القانون 2008/026."
            },
            {
              number: "المادة 19",
              content: "تضبط ضمن سجل خاص الآراء الصادرة عن المجلس بشأن مشاريع ومقترحات القوانين وكذلك بشأن مشاريع المراسيم المعروضة عليها أو التي تصدرها بمبادرتها الخاصة. وبحسب الحالات تحال تلك الآراء إلى رئيس الجمهورية أو إلى الوزير الأول أو إلى رئيسي غرفتي البرلمان."
            },
            {
              number: "المادة 20",
              content: "يقدم الأمين العام للجمعية العلنية مشروع ميزانية السنة المرتقبة بغية المصادقة عليها."
            }
          ]
        },
        {
          title: "إجراءات التحقيق والعقوبات",
          icon: "investigation",
          color: "from-red-500 to-red-600",
          description: "آليات التحقيق وإجراءات المعاقبة",
          articles: [
            {
              number: "المادة 21",
              content: "يقرر فتح التحقيقات وانجاز الخبرات والدراسات المنصوص عليها في المادة 09 من القانون 2008/026 من طرف المجلس وبأمر من الرئيس. تجري التحقيقات تحت إشراف رئيس السلطة العليا للصحافة والسمعيات البصرية وتنفذ من طرف مصالح السلطة العليا التي يمكنها الاستعانة بأي خبرة خارجية عند الاقتضاء. وبإمكان الرئيس في الحالات الاستعجالية أن يأمر بفتح تحقيق على أن تعرض القضية المستهدفة على أقرب اجتماع للمجلس."
            },
            {
              number: "المادة 22",
              content: "عندما يقرر المجلس تطبيقا لسلطة المعاقبة الممنوحة له بمقتضى المادتين 08 و10 من القانون 2008/026 الشروع في تطبيق عقوبة في حق هيئة إعلامية فان المآخذ تعرض على الهيئة المذكورة. ويتمثل ذلك العرض في مراسلة مكتوبة مع تأكيد الاستلام، توجه إلى الهيئة المعنية أو في أي وسيلة ملائمة أخرى. وتحصي المراسلة الوقائع وتسرد المسطرة القانونية المطبقة في هذا المجال مع توضيح أن الوقائع إذا ما تأكدت قد تشكل إخلالا بالترتيبات القانونية أو التنظيمية أو المتعارف عليها مع مطالبة الهيئة بتقديم ملاحظاتها مكتوبة في أجل معقول يتم تحديده في المراسلة المذكورة."
            },
            {
              number: "المادة 23",
              content: "إذا لم ترسل الهيئة الإعلامية ملاحظاتها مكتوبة في الأجل المحدد تكون لدى رئيس السلطة العليا للصحافة والسمعيات البصرية، بالتشاور مع الأعضاء، صلاحية توجيه مراسلة تذكيرية تمنحها أجلا إضافيا. وفي حالة عدم الرد يكون بوسع المجلس اتخاذ القرار الذي يراه مناسبا على ضوء العناصر المتوفرة لديه."
            },
            {
              number: "المادة 24",
              content: "بالنظر إلى التقارير المعدة من طرف مصالح السلطة العليا على أساس التحريات والملاحظات التي قد تصدر عن الهيئة المعنية تقرر المجلس إقفال الإجراء أو متابعته. وفي الحالة الأخيرة تستدعى الجهة المعنية لكي يستمع إليها المجلس. وإذا رفضت الجهة المذكورة المثول أمام المجلس فإن المجلس يصبح مخولا بإجراء مداولاته والبت في الأمر. كما يمكن المجلس أن يستدعي أي شخص يعتبر أن الاستماع إليه قد يساهم في إيضاح المعلومات المتاحة. بوسع المجلس إصدار توصية إلى الأمانة العامة بخصوص القضايا المعقدة التي لا تتوفر السلطة العليا على الخبرات الضرورية لها باللجوء لخبير خارجي من اجل معالجة الملف. وفي هذه الحالة يحرر الخبير تقريرا يعرض على المجلس الذي يقرر على ضوء توصيات الخبير إقفال الإجراء أو متابعته طبقا للشروط الواردة في النقطتين السابقتين. لا يمكن للخبير حضور مداولات المجلس."
            },
            {
              number: "المادة 25",
              content: "يبلغ المجلس الجهة المعنية بالقرار عن طريق رسالة مع تأكيد الاستلام أو بأي طريقة مناسبة أخرى. وفي حالة ما قرر المجلس إصدار عقوبة فيتم إبلاغ الطرف المعني ثم نشر القرار في النشرة الرسمية للسلطة العليا للصحافة والسمعيات البصرية."
            }
          ]
        },
        {
          title: "إجراءات تتعلق بالشكاوى",
          icon: "complaints",
          color: "from-orange-500 to-orange-600",
          description: "آليات معالجة الشكاوى والبلاغات",
          articles: [
            {
              number: "المادة 26",
              content: "عندما تتلقى السلطة العليا للصحافة والسمعيات البصرية شكاية ضد هيئة إعلامية بسبب انتهاك القوانين والترتيبات المطبقة على قطاع الاتصال السمعي البصري أو بسبب نشر معلومة تنطوي على مساس بشرف الشخص أو تتنافى مع الحقيقة فان الشكوى والوثائق الملحقة توجه إلى الرئيس:",
              items: [
                "إما عن طريق رسالة مع تأكيد الاستلام",
                "إما عن طريق الإيداع لدى مقر السلطة العليا مقابل وصل استلام",
                "إما عن طرق تصريح من الشاكي في مقر السلطة العليا أمام احد العمال المعينين لذلك الغرض من طرف الأمين العام"
              ]
            },
            {
              number: "المادة 27",
              content: "يعين الأمين العام من بين عمال السلطة العليا مقررا ويوجه إلى الطرف أو الأطراف المستهدفة بالعريضة نسخا من نص هذه الأخيرة ومن الوثائق الملحقة بها. يحدد الأمين العام بالتشاور مع الأطراف الأجل الذي تطالب خلاله الأطراف المستهدفة من طرف الطاعن بالرد على الملاحظات والوثائق المقدمة من طرف الطاعن. وتلزم الأطراف بإحالة ملاحظاتها المكتوبة إلى كل واحد من الأطراف المعنية."
            },
            {
              number: "المادة 28",
              content: "بوسع المقرر أن يلجأ، مع احترام حق الرد، إلى أي إجراء يراه مناسبا. فإمكانه على الخصوص دعوة الأطراف إذا لم تقدم بشكل شفوي أو مكتوب الشروح الضرورية لحل الخلاف. وبإمكان الأمين العام، بطلب من المقرر أن يكلف مراقبين من السلطة العليا بإجراء المعاينات بالتنقل إلى عين المكان. وتدعى الأطراف إلى المشاركة في تلك الزيارة. وتكون المعاينات التي يجريها المراقبون موضوع محضر يوقعونه مع الأطراف مع توضيح الأطراف التي تمتنع عن التوقيع. وتتلقى الأطراف نسخة من المحضر المذكور إذا طلبت ذلك."
            },
            {
              number: "المادة 29",
              content: "يحيل الأمين العام ملف التحقيق إلى المجلس الذي يمكنه عند الاقتضاء استدعاء الأطراف إلى جلسة. بوسع المجلس طلب تكملة المعلومات أو بتعميق التحقيق. خلال الجلسة يعرض المقرر شفويا الوسائل واستنتاجات الأطراف. وترد الأطراف، مع إمكانية استحالتها بخبرة خارجية على أسئلة الأعضاء وتعرض ملاحظاتها الشفوية. وتتخذ القرارات المتعلقة بالشكاوى من طرف المجلس خلال نفس الجلسة."
            },
            {
              number: "المادة 30",
              content: "يتم إشعار الأطراف بالقرارات التي تتخذها الجمعية العلنية بشأن الشكاوى المعروضة عليها عن طريق مراسلة مع تأكيد الاستلام أو بأي وسيلة ملائمة أخرى. كما تنشر أو تدون في النشرة الرسمية باستثناء الأسرار التي يحفظها القانون."
            }
          ]
        }
      ],
      
      backToTop: t('backToTop')
    }
  }
  
  const content = bylawsData[locale as keyof typeof bylawsData]
  
  const getChapterIcon = (iconType: string) => {
    switch (iconType) {
      case 'general':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        )
      case 'council':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L3.09 8.26L4 21H20L20.91 8.26L12 2ZM18.5 19H5.5L4.84 9.24L12 4.5L19.16 9.24L18.5 19Z"/>
          </svg>
        )
      case 'decisions':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22H9Z"/>
          </svg>
        )
      case 'investigation':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
          </svg>
        )
      case 'complaints':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17M11,9H13V7H11V9Z"/>
          </svg>
        )
      default:
        return null
    }
  }
  
  return (
    <article className="min-h-screen pb-24" dir={direction}>
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-accent to-primary text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-40 h-40 border-2 border-white rounded-lg transform rotate-12"></div>
          <div className="absolute bottom-20 right-1/4 w-32 h-32 border-2 border-secondary rounded-lg transform -rotate-12"></div>
          <div className="absolute top-1/2 left-10 w-24 h-24 bg-secondary/30 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-28 h-28 bg-white/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-40 left-1/3 w-20 h-20 bg-secondary/20 rounded-full blur-lg"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-12">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  {content.title}
                </h1>
                <div className="w-32 h-1 bg-secondary mx-auto"></div>
                <p className="text-xl md:text-2xl text-white/90 font-light max-w-4xl mx-auto leading-relaxed">
                  {content.subtitle}
                </p>
              </div>
              
              {/* Enhanced Visual Element */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 transform hover:scale-105 transition-transform duration-300">
                    <svg className="w-16 h-16 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-secondary rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22H9M10,16V19.08L13.08,16H20V4H4V16H10Z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                {content.intro}
              </p>
            </div>
            
            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{content.chapters.length}</div>
                <div className="text-white/80 text-sm mt-1">
                  {t('chapters')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">30</div>
                <div className="text-white/80 text-sm mt-1">
                  {t('articles')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">2008</div>
                <div className="text-white/80 text-sm mt-1">
                  {t('adoptionYear')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">26</div>
                <div className="text-white/80 text-sm mt-1">
                  {t('lawNumber')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Chapter Navigation */}
      <section className="relative bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t('exploreChapters')}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('clickChapterDescription')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.chapters.map((chapter, index) => (
              <a
                key={index}
                href={`#chapter-${index + 1}`}
                className="group block bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary/30 transform hover:-translate-y-2"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${chapter.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                      {getChapterIcon(chapter.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        {t('chapter')} {index + 1}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                        {chapter.title}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {chapter.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {chapter.articles.length} {t('articles')}
                    </span>
                    <svg className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={locale === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Chapters Content */}
      <section className="relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="space-y-20">
            {content.chapters.map((chapter, chapterIndex) => (
              <div
                key={chapterIndex}
                id={`chapter-${chapterIndex + 1}`}
                className="scroll-mt-8"
              >
                {/* Enhanced Chapter Header */}
                <div className="text-center space-y-8 mb-16">
                  <div className="inline-flex items-center gap-6 bg-white rounded-2xl px-8 py-6 shadow-lg border border-gray-100">
                    <div className={`w-16 h-16 bg-gradient-to-r ${chapter.color} rounded-xl flex items-center justify-center text-white`}>
                      {getChapterIcon(chapter.icon)}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        {t('chapter')} {chapterIndex + 1}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {chapter.title}
                      </h2>
                    </div>
                  </div>
                  
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    {chapter.description}
                  </p>
                </div>

                {/* Enhanced Articles Grid */}
                <div className="space-y-8">
                  {chapter.articles.map((article, articleIndex) => (
                    <div
                      key={articleIndex}
                      className="bg-white rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                    >
                      <div className="space-y-6">
                        {/* Article Header */}
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 bg-gradient-to-r ${chapter.color} text-white rounded-xl flex items-center justify-center font-bold text-lg`}>
                            {articleIndex + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">
                              {article.number}
                            </h3>
                          </div>
                        </div>
                        
                        {/* Article Content */}
                        <div className="space-y-6">
                          <p className="text-gray-700 leading-relaxed text-justify text-lg">
                            {article.content}
                          </p>
                          
                          {/* Article Items */}
                          {article.items && (
                            <div className="bg-gray-50 rounded-xl p-6">
                              <ul className="space-y-4">
                                {article.items.map((item, itemIndex) => (
                                  <li key={itemIndex} className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                                    </div>
                                    <span className="text-gray-700 leading-relaxed flex-1 text-justify">
                                      {item}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="relative bg-gradient-to-r from-primary to-accent text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17M11,9H13V7H11V9Z"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              {t('internalRegulationsInForce')}
            </h2>
            <div className="w-32 h-1 bg-secondary mx-auto"></div>
            <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('adoptedByLaw')}
            </p>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <BackToTopButton label={content.backToTop} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale } = await paramsPromise
  
  const titles = {
    fr: "Règlement Intérieur - Autorité Supérieure HAPA",
    ar: "النظام الداخلي - السلطة العليا للصحافة والسمعيات البصرية"
  }
  
  const descriptions = {
    fr: "Consultez le règlement intérieur de la Haute Autorité de la Presse et de l'Audiovisuel : organisation, procédures et fonctionnement interne.",
    ar: "اطلع على النظام الداخلي للسلطة العليا للصحافة والسمعيات البصرية: التنظيم والإجراءات وسير العمل الداخلي."
  }
  
  return generateMeta({
    doc: {
      meta: {
        title: titles[locale as keyof typeof titles] || titles.fr,
        description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
      }
    }
  })
}

export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'ar' }
  ]
}