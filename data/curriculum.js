/**
 * FreeEnglish - Predefined CEFR Curriculum
 * Levels A1 to C2 with core topics
 */

const CURRICULUM = {
    'A1': [
        { id: 'a1_greetings', title: 'Greetings & Introductions', focus: 'vocabulary' },
        { id: 'a1_numbers', title: 'Numbers & Counting', focus: 'vocabulary' },
        { id: 'a1_to_be', title: 'The verb "To Be"', focus: 'grammar' },
        { id: 'a1_family', title: 'Family & Relationships', focus: 'vocabulary' },
        { id: 'a1_daily_routines', title: 'Daily Routines', focus: 'vocabulary' },
        { id: 'a1_articles', title: 'Articles (a, an, the)', focus: 'grammar' },
        { id: 'a1_possession', title: 'Possessive Adjectives', focus: 'grammar' },
        { id: 'a1_food', title: 'Food & Basic Drinks', focus: 'vocabulary' },
        { id: 'a1_colors_clothes', title: 'Colors & Clothes', focus: 'vocabulary' },
        { id: 'a1_prepositions_place', title: 'Prepositions of Place', focus: 'grammar' }
    ],
    'A2': [
        { id: 'a2_past_simple', title: 'Past Simple Tense', focus: 'grammar' },
        { id: 'a2_past_experiences', title: 'Personal Experiences', focus: 'vocabulary' },
        { id: 'a2_travel', title: 'Travel & Transport', focus: 'vocabulary' },
        { id: 'a2_comparatives', title: 'Comparatives & Superlatives', focus: 'grammar' },
        { id: 'a2_future_plans', title: 'Future Plans (will/going to)', focus: 'grammar' },
        { id: 'a2_weather', title: 'Weather & Environment', focus: 'vocabulary' },
        { id: 'a2_shopping', title: 'Shopping & Prices', focus: 'vocabulary' },
        { id: 'a2_present_continuous', title: 'Present Continuous', focus: 'grammar' },
        { id: 'a2_hobbies', title: 'Hobbies & Leisure', focus: 'vocabulary' },
        { id: 'a2_health', title: 'Parts of the Body & Health', focus: 'vocabulary' }
    ],
    'B1': [
        { id: 'b1_present_perfect', title: 'Present Perfect Simple', focus: 'grammar' },
        { id: 'b1_past_habits', title: 'Past Habits (used to)', focus: 'grammar' },
        { id: 'b1_work', title: 'The World of Work', focus: 'vocabulary' },
        { id: 'b1_education', title: 'Education & Learning', focus: 'vocabulary' },
        { id: 'b1_conditionals_1', title: 'First Conditionals', focus: 'grammar' },
        { id: 'b1_opinions', title: 'Expressing Opinions', focus: 'phrases' },
        { id: 'b1_media', title: 'Media & Entertainment', focus: 'vocabulary' },
        { id: 'b1_reported_speech', title: 'Reported Speech', focus: 'grammar' },
        { id: 'b1_technology', title: 'Technology in Life', focus: 'vocabulary' },
        { id: 'b1_modals_advice', title: 'Modals for Advice & Obligation', focus: 'grammar' }
    ],
    'B2': [
        { id: 'b2_conditionals_mixed', title: 'Second & Mixed Conditionals', focus: 'grammar' },
        { id: 'b2_passive_voice', title: 'Passive Voice (all tenses)', focus: 'grammar' },
        { id: 'b2_idioms', title: 'Common Idioms', focus: 'phrases' },
        { id: 'b2_crime_justice', title: 'Crime & Justice', focus: 'vocabulary' },
        { id: 'b2_global_issues', title: 'Global Issues', focus: 'vocabulary' },
        { id: 'b2_future_perfect', title: 'Future Perfect & Continuous', focus: 'grammar' },
        { id: 'b2_relative_clauses', title: 'Relative Clauses', focus: 'grammar' },
        { id: 'b2_lifestyle', title: 'Lifestyles & Change', focus: 'vocabulary' },
        { id: 'b2_modals_speculation', title: 'Modals of Speculation', focus: 'grammar' },
        { id: 'b2_business_english', title: 'Business English Basics', focus: 'vocabulary' }
    ],
    'C1': [
        { id: 'c1_inversion', title: 'Inversion with Negative Adverbials', focus: 'grammar' },
        { id: 'c1_advanced_conditionals', title: 'Past Conditionals & Regret', focus: 'grammar' },
        { id: 'c1_academic_writing', title: 'Academic Writing & Rhetoric', focus: 'phrases' },
        { id: 'c1_abstract_concepts', title: 'Abstract Concepts', focus: 'vocabulary' },
        { id: 'c1_phrasal_verbs_adv', title: 'Advanced Phrasal Verbs', focus: 'vocabulary' },
        { id: 'c1_narrative_tenses', title: 'Narrative Tenses & Flow', focus: 'grammar' },
        { id: 'c1_cultural_nuance', title: 'Cultural Nuances', focus: 'phrases' },
        { id: 'c1_social_ethics', title: 'Social & Ethical Debates', focus: 'vocabulary' },
        { id: 'c1_advanced_passives', title: 'Advanced Passive Structures', focus: 'grammar' },
        { id: 'c1_expressing_hypotheses', title: 'Expressing Hypotheses', focus: 'grammar' }
    ],
    'C2': [
        { id: 'c2_metaphor_idiom', title: 'Metaphors & Figurative Language', focus: 'phrases' },
        { id: 'c2_professional_negotiation', title: 'Professional Negotiation', focus: 'phrases' },
        { id: 'c2_literary_analysis', title: 'Literary & Textual Nuance', focus: 'vocabulary' },
        { id: 'c2_complex_debates', title: 'Structuring Complex Debates', focus: 'phrases' },
        { id: 'c2_scientific_discourse', title: 'Scientific & Technical Discourse', focus: 'vocabulary' },
        { id: 'c2_subtle_connotation', title: 'Subtle Connotations', focus: 'vocabulary' },
        { id: 'c2_master_grammar', title: 'Mastery of Complex Structures', focus: 'grammar' },
        { id: 'c2_idiomatic_fluency', title: 'Native-like Idiomatic Fluency', focus: 'phrases' },
        { id: 'c2_precision_expression', title: 'Precision in Expression', focus: 'phrases' },
        { id: 'c2_archaic_formal', title: 'Archaic & Formal English', focus: 'vocabulary' }
    ]
};

if (typeof window !== 'undefined') {
    window.CURRICULUM = CURRICULUM;
}
