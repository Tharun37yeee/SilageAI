import json
from datetime import datetime, timedelta

def get_seed_submissions():
    """
    Returns 5 realistic synthetic farm submissions:
    1. High Ridge Holsteins (Discard: visible white/blue mold, musty, pH 5.4)
    2. Sunburst Dairy (Caution: photo looks mostly fine golden/olive, but Ammonia smell, wet/slimy, pH 5.1 -> Hidden Clostridial)
    3. Prairie View Organics (Caution: caramelized brown heat damage, sweet smell, dry, pH 4.3)
    4. Cedar Creek Dairy (Safe: prime golden-olive, sweet fermented normal, normal moisture, pH 3.9)
    5. Oak Ridge Farms (Discard: black anaerobic rot, rancid/rotten smell, wet/slimy, pH 5.8)
    """
    now = datetime.now()
    
    return [
        {
            "farm_name": "High Ridge Holsteins - Bunker 4 (Top Face)",
            "farmer_name": "Dan Miller",
            "phone_number": "(608) 555-0142",
            "email": "dan.miller@highridgeholsteins.com",
            "farm_location": "Verona, WI",
            "timestamp": (now - timedelta(hours=1, minutes=15)).strftime("%Y-%m-%d %H:%M"),
            "smell_rating": "Musty",
            "moisture_feel": "Normal",
            "ph_reading": 5.4,
            "photo_url": "/static/sample_images/sample_moldy_bunker.jpg",
            "severity_tier": "Discard — do not feed",
            "severity_level": "discard",
            "short_summary": "Extensive surface Penicillium/Mucor mold colonies with elevated pH 5.4.",
            "explanation": "Significant spoilage indicators were identified in this sample: visible white mycelium patches and blue-green Penicillium mold colonies on the forage surface, a 'musty' smell rating, and 'normal' moisture feel alongside a high pH reading of 5.4. These characteristics confirm advanced aerobic decay and high mycotoxin exposure risk.",
            "recommended_action": "Isolate and discard the top 8–12 inches across the entire bunker face immediately; do not feed to lactating, transition, or dry cows.",
            "cues_detected": json.dumps([
                "Visible white mycelium patches and blue-green Penicillium mold colonies on forage surface",
                "Smell reported as: 'Musty'",
                "Moisture texture reported as: 'Normal'",
                "Silage pH measured at 5.4"
            ]),
            "raw_reasoning": "DIAGNOSTIC TRIAGE: Flagged for immediate discard. Primary drivers: Extensive visible fungal mold growth (Penicillium / Mucor risk); Critically elevated pH (5.4) combined with Musty smell confirms aerobic fermentation breakdown. Agronomic recommendation: Remove minimum 8-12 inches of bunk face, inspect plastic seal integrity, check face feed-out rate.",
            "confidence_score": 0.98,
            "source": "gemini_multimodal",
            "followed_up": 0,
            "created_at": (now - timedelta(hours=1, minutes=15)).isoformat()
        },
        {
            "farm_name": "Sunburst Dairy - Drive-Over Pile B",
            "farmer_name": "Sarah Jenkins",
            "phone_number": "(608) 555-0189",
            "email": "s.jenkins@sunburstdairy.com",
            "farm_location": "Mount Horeb, WI",
            "timestamp": (now - timedelta(hours=3, minutes=40)).strftime("%Y-%m-%d %H:%M"),
            "smell_rating": "Ammonia-like",
            "moisture_feel": "Wet/slimy",
            "ph_reading": 5.1,
            "photo_url": "/static/sample_images/sample_clostridial_wet.jpg",
            "severity_tier": "Feed with caution",
            "severity_level": "caution",
            "short_summary": "Hidden clostridial fermentation detected (Ammonia smell & pH 5.1 despite uniform photo).",
            "explanation": "Moderate risk factors were observed: while the photo exhibits uniform olive forage particles without overt mold mats, the 'ammonia-like' odor, 'wet/slimy' texture, and elevated pH of 5.1 confirm clostridial secondary fermentation and excessive proteolysis. Free butyric acid accumulation is probable.",
            "recommended_action": "Cap inclusion rate in the total mixed ration (TMR) to under 10–12% dry matter, avoid feeding to fresh/transition cows, and retest bunker face in 48 hours.",
            "cues_detected": json.dumps([
                "Uniform olive forage particle distribution without surface mold",
                "Smell reported as: 'Ammonia-like'",
                "Moisture texture reported as: 'Wet/slimy'",
                "Silage pH measured at 5.1"
            ]),
            "raw_reasoning": "DIAGNOSTIC TRIAGE: Flagged for caution. Hidden clostridial breakdown: Ammonia-like odor indicates severe amino acid deamination and proteolysis; Elevated pH (5.1) exceeds safe corn silage stability (<4.2); Wet/slimy moisture indicates seepage risk. Photo looks deceptively green but chemistry is compromised.",
            "confidence_score": 0.94,
            "source": "gemini_multimodal",
            "followed_up": 0,
            "created_at": (now - timedelta(hours=3, minutes=40)).isoformat()
        },
        {
            "farm_name": "Prairie View Organics - Trench Silo East",
            "farmer_name": "Marcus Larson",
            "phone_number": "(715) 555-0123",
            "email": "marcus@prairievieworganics.org",
            "farm_location": "Eau Claire, WI",
            "timestamp": (now - timedelta(hours=6, minutes=10)).strftime("%Y-%m-%d %H:%M"),
            "smell_rating": "Sweet/fermented normal",
            "moisture_feel": "Dry",
            "ph_reading": 4.3,
            "photo_url": "/static/sample_images/sample_caramelized_heat.jpg",
            "severity_tier": "Feed with caution",
            "severity_level": "caution",
            "short_summary": "Maillard heat damage and caramelized brown bands with dry texture.",
            "explanation": "Moderate risk factors were observed: dark tobacco-brown caramelized forage patches from Maillard heat reaction, combined with a 'sweet/fermented normal' aroma and 'dry' moisture feel with a pH of 4.3. While acid fermentation stabilized, excessive heating has bound dietary proteins.",
            "recommended_action": "Submit a forage sample for Acid Detergent Insoluble Crude Protein (ADICP) testing to adjust crude protein balance in the ration; pack bunker face tighter.",
            "cues_detected": json.dumps([
                "Dark tobacco-brown caramelized forage patches (Maillard heat reaction)",
                "Smell reported as: 'Sweet/fermented normal'",
                "Moisture texture reported as: 'Dry'",
                "Silage pH measured at 4.3"
            ]),
            "raw_reasoning": "DIAGNOSTIC TRIAGE: Flagged for caution. Heat damage: Caramelized browning and dry feel indicate aerobic heating post-harvest before anaerobic sealing; pH 4.3 is acceptable, but available crude protein is significantly reduced due to Maillard polymerization.",
            "confidence_score": 0.91,
            "source": "gemini_multimodal",
            "followed_up": 1,
            "created_at": (now - timedelta(hours=6, minutes=10)).isoformat()
        },
        {
            "farm_name": "Cedar Creek Dairy - Ag-Bag North #2",
            "farmer_name": "Hannah Zimmerman",
            "phone_number": "(920) 555-0177",
            "email": "hannah@cedarcreekdairy.com",
            "farm_location": "Appleton, WI",
            "timestamp": (now - timedelta(hours=9, minutes=25)).strftime("%Y-%m-%d %H:%M"),
            "smell_rating": "Sweet/fermented normal",
            "moisture_feel": "Normal",
            "ph_reading": 3.9,
            "photo_url": "/static/sample_images/sample_safe_silage.jpg",
            "severity_tier": "Safe to feed",
            "severity_level": "safe",
            "short_summary": "No spoilage indicators detected; optimal lactic acid fermentation.",
            "explanation": "No spoilage indicators detected based on the submitted photo and manual inputs. The image shows uniform golden-olive forage coloration with clean chopped kernel distribution, supported by a normal 'sweet/fermented normal' aroma and 'normal' moisture feel and an optimal pH reading of 3.9. Preservation parameters align with high-quality fermented silage.",
            "recommended_action": "No special action needed; maintain clean bunk face management and feed as a standard component of the dairy ration.",
            "cues_detected": json.dumps([
                "Uniform golden-olive forage coloration with clean chopped kernel distribution",
                "Smell reported as: 'Sweet/fermented normal'",
                "Moisture texture reported as: 'Normal'",
                "Silage pH measured at 3.9"
            ]),
            "raw_reasoning": "DIAGNOSTIC TRIAGE: Green tier. No spoilage indicators detected. Preservation parameters: Smell='Sweet/fermented normal', Moisture='Normal', pH=3.9. Visual: Uniform golden-olive forage coloration. Lactic acid fermentation is robust and stable.",
            "confidence_score": 0.99,
            "source": "gemini_multimodal",
            "followed_up": 0,
            "created_at": (now - timedelta(hours=9, minutes=25)).isoformat()
        },
        {
            "farm_name": "Oak Ridge Farms - Bunker 1 South",
            "farmer_name": "Robert Kowalski",
            "phone_number": "(608) 555-0195",
            "email": "rkowalski@oakridgefarms.net",
            "farm_location": "Platteville, WI",
            "timestamp": (now - timedelta(hours=14, minutes=5)).strftime("%Y-%m-%d %H:%M"),
            "smell_rating": "Rancid/rotten",
            "moisture_feel": "Wet/slimy",
            "ph_reading": 5.8,
            "photo_url": "/static/sample_images/sample_slimy_rot.jpg",
            "severity_tier": "Discard — do not feed",
            "severity_level": "discard",
            "short_summary": "Severe butyric rot, foul odor, slimy texture, and fermentation collapse (pH 5.8).",
            "explanation": "Significant spoilage indicators were identified in this sample: dark discolored anaerobic decomposition pockets visible, a 'rancid/rotten' smell rating, and 'wet/slimy' moisture feel alongside a high pH reading of 5.8. These characteristics confirm complete fermentation collapse and severe butyric acid accumulation.",
            "recommended_action": "Isolate and discard the entire decomposed bottom bunker section immediately; do not blend or feed to any dairy animals under any circumstances.",
            "cues_detected": json.dumps([
                "Dark discolored anaerobic decomposition pockets visible",
                "Smell reported as: 'Rancid/rotten'",
                "Moisture texture reported as: 'Wet/slimy'",
                "Silage pH measured at 5.8"
            ]),
            "raw_reasoning": "DIAGNOSTIC TRIAGE: Flagged for immediate discard. Primary drivers: Foul rancid/rotten smell indicates advanced butyric clostridial degradation; Dark anaerobic slime and high pH 5.8 confirm fermentation failure. Severe risk of bovine ketosis and herd-wide feed refusal.",
            "confidence_score": 0.99,
            "source": "gemini_multimodal",
            "followed_up": 0,
            "created_at": (now - timedelta(hours=14, minutes=5)).isoformat()
        }
    ]
