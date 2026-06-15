"""
时间与生命进度计算工具
职责单一：只做日期数学运算，不涉及 I/O
"""

from datetime import date, datetime


def calculate_days_on_earth(birth_date_str: str) -> int:
    """
    计算从出生日到今天，在地球上度过的天数。

    Args:
        birth_date_str: ISO 格式日期字符串，如 "1995-05-20"

    Returns:
        整数天数（出生日当天计为第 1 天）
    """
    birth = datetime.fromisoformat(birth_date_str).date()
    today = date.today()
    delta = today - birth
    return delta.days


def get_year_progress() -> float:
    """
    计算今年已经过去的进度百分比。

    Returns:
        0.0 ~ 100.0 之间的浮点数
    """
    today = date.today()
    start_of_year = date(today.year, 1, 1)
    end_of_year   = date(today.year, 12, 31)
    total_days  = (end_of_year - start_of_year).days + 1
    passed_days = (today - start_of_year).days + 1
    return round((passed_days / total_days) * 100, 2)
