"""
Customer Background Check - Configuration

Configuration file for API keys, data source URLs, and settings.
Sensitive keys should be set via environment variables.
"""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"

# ==================
# Email Validation
# ==================
PERSONAL_EMAIL_DOMAINS_FILE = DATA_DIR / "personal_email_domains.txt"

# Personal email domains (fallback if file not found)
PERSONAL_EMAIL_DOMAINS = [
    # Common personal email providers
    "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "yahoo.fr",
    "hotmail.com", "hotmail.co.uk", "outlook.com", "live.com", "msn.com",
    "aol.com", "icloud.com", "me.com", "mac.com", "mail.com", "gmx.com",
    "gmx.de", "gmx.fr", "gmx.net", "web.de", "t-online.de", "yandex.com",
    "yandex.ru", "mail.ru", "inbox.ru", "list.ru", "rambler.ru", "qq.com",
    "163.com", "126.com", "sina.com", "sohu.com", "tom.com", "21cn.com",
    "foxmail.com", "yeah.net", "naver.com", "hanmail.net", "daum.net",
    "protonmail.com", "protonmail.ch", "tutanota.com", "tutanota.de",
    "zoho.com", "zoho.eu", "fastmail.com", "hushmail.com", "hush.com",
    "lavabit.com", "countermail.com", "mailbox.org", "posteo.de",
    "mailfence.com", "runbox.com", "disroot.org", "riseup.net",
    # Disposable email providers
    "10minutemail.com", "guerrillamail.com", "mailinator.com",
    "throwaway.email", "temp-mail.org", "mohmal.com", "yopmail.com"
]

# ==================
# Phone Validation
# ==================
# Country code mapping
COUNTRY_PHONE_CODES = {
    "UK": "44", "GB": "44",
    "US": "1", "USA": "1",
    "FR": "33", "FRANCE": "33",
    "DE": "49", "GERMANY": "49",
    "SE": "46", "SWEDEN": "46",
    "IT": "39", "ITALY": "39",
    "ES": "34", "SPAIN": "34",
    "NL": "31", "NETHERLANDS": "31",
    "BE": "32", "BELGIUM": "32",
    "AU": "61", "AUSTRALIA": "61",
    "CA": "1", "CANADA": "1",
    "JP": "81", "JAPAN": "81",
    "CN": "86", "CHINA": "86",
    "KR": "82", "SOUTH KOREA": "82",
    "IN": "91", "INDIA": "91",
    "BR": "55", "BRAZIL": "55",
    "MX": "52", "MEXICO": "52",
}

# ==================
# Company Registry Sources
# ==================
COMPANY_REGISTRIES = {
    "UK": {
        "name": "United Kingdom",
        "sources": [
            {
                "name": "Companies House",
                "type": "api",
                "api_url": "https://api.company-information.service.gov.uk",
                "web_url": "https://find-and-update.company-information.service.gov.uk",
                "search_url": "https://find-and-update.company-information.service.gov.uk/companies",
                "requires_api_key": True,
                "api_key_env": "COMPANIES_HOUSE_API_KEY"
            },
            {
                "name": "Endole",
                "type": "web",
                "url": "https://suite.endole.co.uk/portal/company",
                "requires_api_key": False
            }
        ],
        "company_id_format": "8 digits"
    },
    "FR": {
        "name": "France",
        "sources": [
            {
                "name": "data.gouv.fr",
                "type": "api",
                "api_url": "https://recherche-entreprises.api.gouv.fr/search",
                "requires_api_key": False
            },
            {
                "name": "societe.com",
                "type": "web",
                "url": "https://www.societe.com/cgi-bin/search",
                "requires_api_key": False
            },
            {
                "name": "Pages Jaunes",
                "type": "web",
                "url": "https://www.pagesjaunes.fr/recherche",
                "requires_api_key": False
            }
        ],
        "company_id_format": "SIREN (9 digits) / SIRET (14 digits)"
    },
    "SE": {
        "name": "Sweden",
        "sources": [
            {
                "name": "Bolagsverket",
                "type": "web",
                "url": "https://www.bolagsverket.se",
                "requires_api_key": False
            },
            {
                "name": "Allabolag",
                "type": "web",
                "url": "https://www.allabolag.se",
                "requires_api_key": False
            },
            {
                "name": "Hitta",
                "type": "web",
                "url": "https://www.hitta.se",
                "requires_api_key": False
            }
        ],
        "company_id_format": "Organisationsnummer (10 digits)"
    },
    "US": {
        "name": "United States",
        "sources": [
            {
                "name": "Secretary of State",
                "type": "web",
                "note": "Each state has its own registry",
                "requires_api_key": False
            },
            {
                "name": "BBB",
                "type": "web",
                "url": "https://www.bbb.org/search",
                "requires_api_key": False
            }
        ],
        "company_id_format": "State-specific"
    },
    "DE": {
        "name": "Germany",
        "sources": [
            {
                "name": "Bundesanzeiger",
                "type": "web",
                "url": "https://www.bundesanzeiger.de",
                "requires_api_key": False
            },
            {
                "name": "Unternehmensregister",
                "type": "web",
                "url": "https://www.unternehmensregister.de",
                "requires_api_key": False
            }
        ],
        "company_id_format": "Handelsregister (HRA/HRB + number)"
    },
    "AU": {
        "name": "Australia",
        "sources": [
            {
                "name": "ASIC",
                "type": "web",
                "url": "https://connectonline.asic.gov.au/RegistrySearch/faces/landing/SearchRegisters.jspx",
                "requires_api_key": False
            }
        ],
        "company_id_format": "ACN (9 digits) / ABN (11 digits)"
    },
    "CA": {
        "name": "Canada",
        "sources": [
            {
                "name": "Innovation, Science and Economic Development Canada",
                "type": "web",
                "url": "https://ised-isde.canada.ca/app/scr/cc/CorporationsCanadaFESR",
                "requires_api_key": False
            }
        ],
        "company_id_format": "Corporation Number"
    },
    "JP": {
        "name": "Japan",
        "sources": [
            {
                "name": "GVL",
                "type": "web",
                "url": "https://www1.toukei.metro.tokyo.lg.jp/g-men/gmswebtax/SearchShowEnd",
                "requires_api_key": False
            }
        ],
        "company_id_format": "Corporate Number (13 digits)"
    }
}

# Country name to code mapping
COUNTRY_CODE_MAP = {
    "UK": "UK", "UNITED KINGDOM": "UK", "GB": "UK", "BRITAIN": "UK", "ENGLAND": "UK",
    "FRANCE": "FR", "FR": "FR",
    "SWEDEN": "SE", "SE": "SE",
    "USA": "US", "US": "US", "UNITED STATES": "US", "AMERICA": "US",
    "GERMANY": "DE", "DE": "DE",
    "AUSTRALIA": "AU", "AU": "AU",
    "CANADA": "CA", "CA": "CA",
    "JAPAN": "JP", "JP": "JP"
}

# ==================
# Social Media Platforms
# ==================
SOCIAL_MEDIA_PLATFORMS = {
    "linkedin": {
        "name": "LinkedIn",
        "search_patterns": {
            "person": 'site:linkedin.com/in/ "{name}" "{country}"',
            "company": 'site:linkedin.com/company/ "{company}"'
        }
    },
    "facebook": {
        "name": "Facebook",
        "search_patterns": {
            "page": 'site:facebook.com "{company}"'
        }
    },
    "instagram": {
        "name": "Instagram",
        "search_patterns": {
            "profile": 'site:instagram.com "{company}" OR "{name}"'
        }
    },
    "youtube": {
        "name": "YouTube",
        "search_patterns": {
            "channel": 'site:youtube.com "{company}" OR "{name}"'
        }
    }
}

# ==================
# E-commerce Platforms
# ==================
ECOMMERCE_PLATFORMS = {
    "amazon": {
        "name": "Amazon",
        "seller_search_url": "https://www.amazon.com/s?me={seller_id}",
        "search_pattern": 'site:amazon.com "{company}" seller'
    },
    "ebay": {
        "name": "eBay",
        "seller_url": "https://www.ebay.com/usr/{username}",
        "search_pattern": 'site:ebay.com "{company}" seller'
    },
    "alibaba": {
        "name": "Alibaba",
        "supplier_url": "https://www.alibaba.com/showroom/{company}.html",
        "search_pattern": 'site:alibaba.com "{company}" supplier'
    },
    "etsy": {
        "name": "Etsy",
        "shop_url": "https://www.etsy.com/shop/{shop_name}",
        "search_pattern": 'site:etsy.com "{company}" shop'
    }
}

# ==================
# Trade/Customs Data
# ==================
TRADE_DATA_SOURCES = {
    "importgenius": {
        "name": "ImportGenius",
        "url": "https://www.importgenius.com",
        "requires_subscription": True
    },
    "panjiva": {
        "name": "Panjiva",
        "url": "https://panjiva.com",
        "requires_subscription": True
    },
    "tradesparq": {
        "name": "Tradesparq",
        "url": "https://www.tradesparq.com",
        "requires_subscription": False,
        "free_tier": True
    },
    "datamyne": {
        "name": "Datamyne",
        "url": "https://www.datamyne.com",
        "requires_subscription": True
    }
}

# ==================
# Risk Scoring Weights
# ==================
RISK_WEIGHTS = {
    "email_verification": 0.15,
    "company_status": 0.20,
    "personnel_association": 0.20,
    "digital_assets": 0.15,
    "ecommerce_verification": 0.15,
    "trade_verification": 0.15
}

# Risk thresholds
RISK_THRESHOLDS = {
    "low_risk": 80,      # >= 80: Verified
    "medium_risk": 50,   # 50-79: Needs supplement
    "high_risk": 0       # < 50: High risk
}

# ==================
# Scoring Rules
# ==================
SCORING_RULES = {
    "email": {
        "corporate_match": 100,
        "corporate_no_match": 80,
        "personal": 40,
        "invalid": 0
    },
    "company_status": {
        "active_complete": 100,
        "active_incomplete": 70,
        "cannot_verify": 30,
        "dissolved": 0
    },
    "personnel": {
        "director_match": 100,
        "employee_proof": 70,
        "no_evidence": 20,
        "mismatch": 0
    },
    "digital_assets": {
        "website_social_complete": 100,
        "website_only": 70,
        "social_only": 40,
        "none": 20
    },
    "ecommerce": {
        "high_rated_store": 100,
        "store_exists": 70,
        "no_store": 30
    },
    "trade": {
        "import_match": 100,
        "import_no_match": 50,
        "no_record": 40
    }
}

# ==================
# API Keys (from environment)
# ==================
def get_api_key(service_name: str) -> str:
    """Get API key from environment variable."""
    env_var_map = {
        "companies_house": "COMPANIES_HOUSE_API_KEY",
        "importgenius": "IMPORTGENIUS_API_KEY",
        "panjiva": "PANJIVA_API_KEY"
    }
    env_var = env_var_map.get(service_name.lower())
    if env_var:
        return os.environ.get(env_var, "")
    return ""

# ==================
# Utility Functions
# ==================
def load_personal_email_domains() -> set:
    """Load personal email domains from file or use default list."""
    domains = set()

    # Try to load from file
    if PERSONAL_EMAIL_DOMAINS_FILE.exists():
        try:
            with open(PERSONAL_EMAIL_DOMAINS_FILE, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip().lower()
                    if line and not line.startswith('#'):
                        domains.add(line)
            if domains:
                return domains
        except Exception:
            pass

    # Fallback to default list
    return set(d.lower() for d in PERSONAL_EMAIL_DOMAINS)

def get_country_code(country: str) -> str:
    """Normalize country name to country code."""
    if not country:
        return ""
    return COUNTRY_CODE_MAP.get(country.upper().strip(), country.upper().strip())
