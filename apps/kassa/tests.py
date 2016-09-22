from django.core.urlresolvers import reverse
from django.test import TestCase


class TestStats(TestCase):
    def test_start_param(self):
        data = {
            'start': '2016-08-01'
        }
        res = self.client.get(reverse('stats-card-sales'), data)
        self.assertEqual(res.status_code, 200)
